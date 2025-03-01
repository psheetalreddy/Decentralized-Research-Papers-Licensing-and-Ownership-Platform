import React, { useState } from "react";
import { citePaper } from "../utils/contract";

const CitePaper = () => {
  const [paperId, setPaperId] = useState("");
  const [citerAddress, setCiterAddress] = useState("");

  const handleCite = async () => {
    try {
      await citePaper(paperId, citerAddress);
      alert("Paper cited successfully!");
    } catch (error) {
      console.error("Citing failed:", error);
    }
  };

  return (
    <div>
      <h2>Cite Research Paper</h2>
      <input type="text" placeholder="Paper ID" onChange={(e) => setPaperId(e.target.value)} />
      <input type="text" placeholder="Your Address" onChange={(e) => setCiterAddress(e.target.value)} />
      <button onClick={handleCite}>Cite</button>
    </div>
  );
};

export default CitePaper;
