import React, { useState } from "react";
import axios from "axios";
import { uploadPaper } from "../utils/contract";

const UploadForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [accessType, setAccessType] = useState("Free");
  const [borrowDuration, setBorrowDuration] = useState(""); // For borrow option

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const ipfsResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { 
          pinata_api_key: "cb6265cf5e0bf1143a58", 
          pinata_secret_api_key: "5939715c5cab7d898230cf24ea613b84253a067bbb8ef529bd915adbf0a1660c"
        },
      });

      const ipfsHash = ipfsResponse.data.IpfsHash;

      // Convert price to Ether format
      const priceInEther = accessType === "Free" ? "0" : price;

      // Convert borrowDuration to seconds (if applicable)
      const borrowDurationInSeconds = accessType === "Borrow" ? borrowDuration * 86400 : 0; // Convert days to seconds

      // Upload to smart contract
      await uploadPaper(title, author, ipfsHash, priceInEther, accessType, borrowDurationInSeconds);

      alert("Paper uploaded successfully!");
    } catch (error) {
      console.error("Error uploading paper:", error);
      alert("Failed to upload paper.");
    }
  };

  return (
    <div>
      <h2>Upload Research Paper</h2>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Author" onChange={(e) => setAuthor(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <select onChange={(e) => setAccessType(e.target.value)}>
        <option value="Free">Free</option>
        <option value="Paid">Paid</option>
        <option value="Borrow">Borrow</option>
      </select>
      {accessType !== "Free" && (
        <input type="text" placeholder="Price in ETH" onChange={(e) => setPrice(e.target.value)} />
      )}
      {accessType === "Borrow" && (
        <input type="number" placeholder="Borrow Duration (days)" onChange={(e) => setBorrowDuration(e.target.value)} />
      )}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadForm;


/*
JWT
(Secret access token)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyNGVhMjYzNC1jYzEyLTQxZGYtYWZmNy02NzE1MmY0MTZlMWYiLCJlbWFpbCI6InBzaGVldGFscmVkZHkuMTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIzYTcwNDI1N2I5ZTYxMjEzNDk5Iiwic2NvcGVkS2V5U2VjcmV0IjoiNTkzOTcxNWM1Y2FiN2Q4OTgyMzBjZjI0ZWE2MTNiODQyNTNhMDY3YmJiOGVmNTI5YmQ5MTVhZGJmMGExNjYwYyIsImV4cCI6MTc3MjIwNzU1M30.4o_kACN-wSgUOvG38qpZQRKxYB1DTqXA-JP0cb4rtYg
*/