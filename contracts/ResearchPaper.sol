// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ResearchPaper is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _paperIds;

    enum AccessType { Free, Paid, Borrow }

    struct Paper {
        uint256 id;
        string title;
        string author;
        string ipfsHash;
        address owner;
        uint256 price;
        AccessType accessType;
        uint256 borrowDuration; 
        uint256 citations;
    }

    struct BorrowedPaper {
        uint256 startTime;
        bool isBorrowed;
    }

    mapping(uint256 => Paper) public papers;
    mapping(string => bool) private existingHashes;
    mapping(uint256 => mapping(address => BorrowedPaper)) public borrowedPapers;
    mapping(uint256 => address[]) public paperAccessList;

    event PaperUploaded(uint256 indexed paperId, string title, address indexed owner, AccessType accessType);
    event PaperPurchased(uint256 indexed paperId, address indexed buyer);
    event PaperCited(uint256 indexed paperId, address indexed citer);
    event PaperBorrowed(uint256 indexed paperId, address indexed borrower, uint256 duration);
    event BorrowExtended(uint256 indexed paperId, address indexed borrower, uint256 extendedTime);

    function uploadPaper(
        string memory _title,
        string memory _author,
        string memory _ipfsHash,
        uint256 _price,
        AccessType _accessType,
        uint256 _borrowDuration
    ) public {
        require(!existingHashes[_ipfsHash], "Paper already exists");

        _paperIds.increment();
        uint256 paperId = _paperIds.current();

        papers[paperId] = Paper({
            id: paperId,
            title: _title,
            author: _author,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            price: _price,
            accessType: _accessType,
            borrowDuration: _borrowDuration,
            citations: 0
        });

        existingHashes[_ipfsHash] = true;

        emit PaperUploaded(paperId, _title, msg.sender, _accessType);
    }

    function purchasePaper(uint256 _paperId) public payable {
        Paper storage paper = papers[_paperId];
        require(paper.accessType == AccessType.Paid, "Paper is not for sale");
        require(msg.value >= paper.price, "Insufficient payment");

        payable(paper.owner).transfer(msg.value);
        paperAccessList[_paperId].push(msg.sender);

        emit PaperPurchased(_paperId, msg.sender);
    }

    function borrowPaper(uint256 _paperId) public payable {
        Paper storage paper = papers[_paperId];
        require(paper.accessType == AccessType.Borrow, "Paper is not available for borrowing");
        require(msg.value >= paper.price, "Insufficient payment");
        require(!borrowedPapers[_paperId][msg.sender].isBorrowed, "Already borrowed");

        payable(paper.owner).transfer(msg.value);
        borrowedPapers[_paperId][msg.sender] = BorrowedPaper({
            startTime: block.timestamp,
            isBorrowed: true
        });

        emit PaperBorrowed(_paperId, msg.sender, paper.borrowDuration);
    }

    function extendBorrow(uint256 _paperId) public payable {
        Paper storage paper = papers[_paperId];
        require(paper.accessType == AccessType.Borrow, "Paper is not available for borrowing");
        require(borrowedPapers[_paperId][msg.sender].isBorrowed, "You have not borrowed this paper");
        require(msg.value >= paper.price / 2, "Insufficient payment for extension"); // Extension is half the price

        payable(paper.owner).transfer(msg.value);
        borrowedPapers[_paperId][msg.sender].startTime += paper.borrowDuration;

        emit BorrowExtended(_paperId, msg.sender, paper.borrowDuration);
    }

    function citePaper(uint256 _paperId) public {
        Paper storage paper = papers[_paperId];
        require(paper.owner != address(0), "Invalid paper");

        paper.citations += 1;
        payable(paper.owner).transfer(0.001 ether); // Reward for citations

        emit PaperCited(_paperId, msg.sender);
    }

    function checkAccess(uint256 _paperId, address user) public view returns (bool) {
        Paper storage paper = papers[_paperId];

        if (paper.accessType == AccessType.Free) {
            return true;
        }

        if (paper.accessType == AccessType.Paid) {
            for (uint i = 0; i < paperAccessList[_paperId].length; i++) {
                if (paperAccessList[_paperId][i] == user) {
                    return true;
                }
            }
        }

        if (paper.accessType == AccessType.Borrow) {
            BorrowedPaper storage borrowed = borrowedPapers[_paperId][user];
            if (borrowed.isBorrowed && block.timestamp <= borrowed.startTime + paper.borrowDuration) {
                return true;
            }
        }

        return false;
    }
}
