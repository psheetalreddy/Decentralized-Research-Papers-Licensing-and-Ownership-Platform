import React, { useState } from "react";
import { extendBorrow } from "../utils/contract";

const ExtendBorrow = () => {
  const [paperId, setPaperId] = useState("");
  const [userAddress, setUserAddress] = useState("");

  const handleExtend = async () => {
    try {
      await extendBorrow(paperId, userAddress);
      alert("Borrow period extended!");
    } catch (error) {
      console.error("Extension failed:", error);
    }
  };

  return (
    <div>
      <h2>Extend Borrow Period</h2>
      <input type="text" placeholder="Paper ID" onChange={(e) => setPaperId(e.target.value)} />
      <input type="text" placeholder="Your Address" onChange={(e) => setUserAddress(e.target.value)} />
      <button onClick={handleExtend}>Extend</button>
    </div>
  );
};

export default ExtendBorrow;
