// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ResearchPaper is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _paperIds;

    struct Paper {
        uint256 id;
        string title;
        string author;
        string ipfsHash;
        address owner;
        uint256 price;
        uint256 citations;
    }

    mapping(uint256 => Paper) public papers;
    mapping(string => bool) private existingHashes;
    mapping(uint256 => address[]) public paperAccessList;

    event PaperUploaded(uint256 indexed paperId, string title, address indexed owner);
    event PaperPurchased(uint256 indexed paperId, address indexed buyer);
    event PaperCited(uint256 indexed paperId, address indexed citer);

    function uploadPaper(string memory _title, string memory _author, string memory _ipfsHash, uint256 _price) public {
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
            citations: 0
        });

        existingHashes[_ipfsHash] = true;

        emit PaperUploaded(paperId, _title, msg.sender);
    }

    function purchasePaper(uint256 _paperId) public payable {
        Paper storage paper = papers[_paperId];
        require(msg.value >= paper.price, "Insufficient payment");

        payable(paper.owner).transfer(msg.value);
        paperAccessList[_paperId].push(msg.sender);

        emit PaperPurchased(_paperId, msg.sender);
    }

    function citePaper(uint256 _paperId) public {
        Paper storage paper = papers[_paperId];
        require(paper.owner != address(0), "Invalid paper");

        paper.citations += 1;
        payable(paper.owner).transfer(0.001 ether); // Reward for citations

        emit PaperCited(_paperId, msg.sender);
    }

    function getPaper(uint256 _paperId) public view returns (Paper memory) {
        return papers[_paperId];
    }

    function checkAccess(uint256 _paperId, address user) public view returns (bool) {
        for (uint i = 0; i < paperAccessList[_paperId].length; i++) {
            if (paperAccessList[_paperId][i] == user) {
                return true;
            }
        }
        return false;
    }
}
