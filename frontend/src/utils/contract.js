import Web3 from "web3";
import contractABI from "./contractABI.json"; // Ensure the correct path

console.log("Full Contract ABI:", contractABI); // Debugging output

// Access the abi array directly from the contractABI object
const abis = contractABI.abi;

console.log("abi : ", abis);
console.log("type of abi: ", typeof(abis));

// Verify abis is an array before using filter
if (!Array.isArray(abis)) {
  console.error("ABI is not an array:", abis);
  throw new Error("Contract ABI is not in the expected format");
}

// Now safely filter on the array
const filteredMethods = abis.filter((item) => item.type === "function");
console.log("Filtered Methods:", filteredMethods);

const web3 = new Web3(window.ethereum);
const contractAddress = "0x04C24f9fc7284919fB0F2e381F6138dA52318F8b";

// Use the correct ABI format for the contract initialization
const contract = new web3.eth.Contract(abis, contractAddress);

// 📌 Upload Paper
export const uploadPaper = async (title, author, ipfsHash, price) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.uploadPaper(title, author, ipfsHash, web3.utils.toWei(price, "ether"))
    .send({ from: accounts[0] });
};

// 📌 Purchase Paper
export const purchasePaper = async (paperId, price) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.purchasePaper(paperId)
    .send({ from: accounts[0], value: web3.utils.toWei(price, "ether") });
};

// 📌 Cite Paper
export const citePaper = async (paperId) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.citePaper(paperId).send({ from: accounts[0] });
};

// 📌 Extend Borrow (NEW FUNCTION)
export const extendBorrow = async (paperId) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.extendBorrow(paperId).send({ from: accounts[0] });
};

// Export everything
export default filteredMethods;
export { web3, contract };