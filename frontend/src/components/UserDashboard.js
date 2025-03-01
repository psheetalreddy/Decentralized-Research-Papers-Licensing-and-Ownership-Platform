import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = ({ userAddress }) => {
  const [ownedPapers, setOwnedPapers] = useState([]);
  const [purchasedPapers, setPurchasedPapers] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/user-papers/${userAddress}`)
      .then((response) => {
        setOwnedPapers(response.data.owned);
        setPurchasedPapers(response.data.purchased);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, [userAddress]);

  return (
    <div>
      <h2>User Dashboard</h2>
      <h3>My Uploaded Papers</h3>
      <ul>{ownedPapers.map((paper) => <li key={paper.id}>{paper.title}</li>)}</ul>

      <h3>My Purchased Papers</h3>
      <ul>{purchasedPapers.map((paper) => <li key={paper.id}>{paper.title}</li>)}</ul>
    </div>
  );
};

export default UserDashboard;
