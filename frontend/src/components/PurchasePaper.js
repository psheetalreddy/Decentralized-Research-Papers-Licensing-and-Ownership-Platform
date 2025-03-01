import React, { useState } from "react";
import { purchasePaper } from "../utils/contract";

const PurchasePaper = () => {
  const [paperId, setPaperId] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [price, setPrice] = useState("");

  const handlePurchase = async () => {
    try {
      await purchasePaper(paperId, buyerAddress, price);
      alert("Purchase successful!");
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  return (
    <div>
      <h2>Purchase Research Paper</h2>
      <input type="text" placeholder="Paper ID" onChange={(e) => setPaperId(e.target.value)} />
      <input type="text" placeholder="Your Address" onChange={(e) => setBuyerAddress(e.target.value)} />
      <input type="text" placeholder="Price (ETH)" onChange={(e) => setPrice(e.target.value)} />
      <button onClick={handlePurchase}>Purchase</button>
    </div>
  );
};

export default PurchasePaper;
