import BillHistory from "./pages/BillHistory";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "10px" }}>Dashboard</Link>
        <Link to="/billing" style={{ marginRight: "10px" }}>Billing</Link>
        <Link to="/products">Products</Link>
      </nav>

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/bills" element={<BillHistory />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
