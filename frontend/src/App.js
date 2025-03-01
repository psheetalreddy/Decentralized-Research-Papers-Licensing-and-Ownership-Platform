import React, { useState } from "react";
import Web3 from "web3";
import axios from "axios";

const web3 = new Web3(window.ethereum);

const App = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const ipfsResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: { pinata_api_key: "YOUR_PINATA_API_KEY", pinata_secret_api_key: "YOUR_PINATA_SECRET" },
    });

    const ipfsHash = ipfsResponse.data.IpfsHash;
    
    await axios.post("http://localhost:5000/upload", { title, author, ipfsHash, price: "0.1" });

    alert("Paper uploaded!");
  };

  return (
    <div>
      <h2>Upload Research Paper</h2>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Author" onChange={(e) => setAuthor(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default App;
