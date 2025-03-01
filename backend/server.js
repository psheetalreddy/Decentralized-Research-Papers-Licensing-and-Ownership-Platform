require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Web3 = require("web3").default;
const fs = require("fs");
const contractABI = require("./contractABI.json");


const app = express();
app.use(cors());
app.use(express.json());

const web3 = new Web3("http://127.0.0.1:7545"); // Ganache RPC URL

const contractAddress = "0x04C24f9fc7284919fB0F2e381F6138dA52318F8b";
const contract = new web3.eth.Contract(contractABI, contractAddress);

mongoose.connect("mongodb://127.0.0.1:27017/research_papers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

app.post('/authenticate', (req, res) => {
  const { message, signature, account } = req.body;

  // Recover the signer's address from the message and signature
  const recoveredAddress = web3.eth.accounts.recover(message, signature);

  if (recoveredAddress.toLowerCase() === account.toLowerCase()) {
    // Successfully authenticated
    // Here you can generate a session or JWT token for further user sessions.
    res.json({ success: true, message: 'User authenticated!' });
  } else {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

const paperSchema = new mongoose.Schema({
  title: String,
  author: String,
  ipfsHash: String,
  price: String,
  accessType: String,  // Free, Paid, Borrow
  borrowDuration: Number, // Duration in seconds
  borrowers: [{ address: String, expiry: Number }], // Track borrowed papers
});

const Paper = mongoose.model("Paper", paperSchema);

// Upload Paper
app.post("/upload", async (req, res) => {
  try {
    const { title, author, ipfsHash, price, accessType, borrowDuration } = req.body;
    const accounts = await web3.eth.getAccounts();

    await contract.methods.uploadPaper(title, author, ipfsHash, web3.utils.toWei(price, "ether"))
      .send({ from: accounts[0] });

    const newPaper = new Paper({ title, author, ipfsHash, price, accessType, borrowDuration, borrowers: [] });
    await newPaper.save();

    res.json({ message: "Paper uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase or Borrow Paper
app.post("/purchase", async (req, res) => {
  try {
    const { paperId, buyerAddress, price, borrow } = req.body;
    const paper = await Paper.findById(paperId);

    if (!paper) return res.status(404).json({ error: "Paper not found" });

    if (paper.accessType === "Free") {
      return res.json({ message: "Access granted for free paper!" });
    }

    await contract.methods.purchasePaper(paperId)
      .send({ from: buyerAddress, value: web3.utils.toWei(price, "ether") });

    if (borrow && paper.accessType === "Borrow") {
      const expiry = Date.now() + paper.borrowDuration * 1000; // Convert to milliseconds
      paper.borrowers.push({ address: buyerAddress, expiry });
      await paper.save();
    }

    res.json({ message: "Paper purchased successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extend Borrow Period
app.post("/extend-borrow", async (req, res) => {
  try {
    const { paperId, borrowerAddress, extensionDays, extensionFee } = req.body;
    const paper = await Paper.findById(paperId);

    if (!paper) return res.status(404).json({ error: "Paper not found" });
    if (paper.accessType !== "Borrow") return res.status(400).json({ error: "Extension not allowed" });

    const borrower = paper.borrowers.find(b => b.address === borrowerAddress);
    if (!borrower) return res.status(400).json({ error: "User hasn't borrowed this paper" });

    await contract.methods.purchasePaper(paperId)
      .send({ from: borrowerAddress, value: web3.utils.toWei(extensionFee, "ether") });

    borrower.expiry += extensionDays * 86400 * 1000; // Extend borrow period
    await paper.save();

    res.json({ message: "Borrow period extended successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cite Paper
app.post("/cite", async (req, res) => {
  try {
    const { paperId, citerAddress } = req.body;

    await contract.methods.citePaper(paperId)
      .send({ from: citerAddress });

    res.json({ message: "Paper cited successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Papers
app.get("/papers", async (req, res) => {
  try {
    const papers = await Paper.find();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check Borrow Access
app.post("/check-access", async (req, res) => {
  try {
    const { paperId, userAddress } = req.body;
    const paper = await Paper.findById(paperId);

    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const borrower = paper.borrowers.find(b => b.address === userAddress);
    if (borrower && borrower.expiry > Date.now()) {
      return res.json({ access: true, expiry: borrower.expiry });
    }

    res.json({ access: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
