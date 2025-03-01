const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Web3 = require("web3");
const contractABI = require("./contractABI.json");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const web3 = new Web3("http://127.0.0.1:7545"); // Ganache RPC URL
const contractAddress = "YOUR_SMART_CONTRACT_ADDRESS";
const contract = new web3.eth.Contract(contractABI, contractAddress);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const paperSchema = new mongoose.Schema({
  title: String,
  author: String,
  ipfsHash: String,
  price: String,
});

const Paper = mongoose.model("Paper", paperSchema);

// Upload Paper
app.post("/upload", async (req, res) => {
  const { title, author, ipfsHash, price } = req.body;
  const accounts = await web3.eth.getAccounts();

  await contract.methods.uploadPaper(title, author, ipfsHash, web3.utils.toWei(price, "ether"))
    .send({ from: accounts[0] });

  const newPaper = new Paper({ title, author, ipfsHash, price });
  await newPaper.save();

  res.json({ message: "Paper uploaded successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
