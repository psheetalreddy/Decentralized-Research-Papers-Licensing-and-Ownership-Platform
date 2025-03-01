import React, { useEffect, useState } from "react";
import axios from "axios";

const ListPapers = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/papers")
      .then((response) => setPapers(response.data))
      .catch((error) => console.error("Error fetching papers:", error));
  }, []);

  return (
    <div>
      <h2>Available Research Papers</h2>
      <ul>
        {papers.map((paper) => (
          <li key={paper._id}>
            <strong>{paper.title}</strong> by {paper.author} | Price: {paper.price} ETH
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListPapers;
