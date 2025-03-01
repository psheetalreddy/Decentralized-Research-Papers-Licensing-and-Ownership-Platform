import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import UploadPaper from "./components/UploadPaper";
import ListPapers from "./components/ListPapers";
import PurchasePaper from "./components/PurchasePaper";
import UserDashboard from "./components/UserDashboard";
import ExtendBorrow from "./components/ExtendBorrow";
import CitePaper from "./components/CitePaper";
import Login from "./components/login";

console.log("App component loaded");

const App = () => {
  return (
    <Router>
      <div>
        <h1>Research Paper Marketplace</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Upload Paper</Link></li>
            <li><Link to="/purchase">Purchase Paper</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/extend-borrow">Extend Borrow</Link></li>
            <li><Link to="/cite">Cite Paper</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<ListPapers />} />
          <Route path="/upload" element={<UploadPaper />} />
          <Route path="/purchase" element={<PurchasePaper />} />
          <Route path="/dashboard" element={<UserDashboard userAddress="0xYourAddress" />} />
          <Route path="/extend-borrow" element={<ExtendBorrow />} />
          <Route path="/cite" element={<CitePaper />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// const App = () => {
//   return (
//     <div>
//       <h1>React is Working!</h1>
//       <p>If you see this, the app is rendering correctly.</p>
//     </div>
//   );
// };

// export default App;