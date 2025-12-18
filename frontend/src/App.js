import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";
import BillHistory from "./pages/BillHistory";
import Login from "./pages/Login";
import PrintBill from "./pages/PrintBill";
import CustomerStatement from "./pages/CustomerStatement";
import PrintCustomerStatement from "./pages/PrintCustomerStatement";

import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn, logout } from "./utils/auth";

function App() {
  return (
    <BrowserRouter>
      {/* ================= NAVBAR ================= */}
      {isLoggedIn() && (
        <nav
          style={{
            padding: "10px",
            background: "#eee",
            marginBottom: "20px",
          }}
        >
          <Link to="/" style={{ marginRight: "12px" }}>
            Dashboard
          </Link>

          <Link to="/billing" style={{ marginRight: "12px" }}>
            Billing
          </Link>

          <Link to="/products" style={{ marginRight: "12px" }}>
            Products
          </Link>

          <Link to="/customers" style={{ marginRight: "12px" }}>
            Customers
          </Link>

          <Link to="/bills" style={{ marginRight: "12px" }}>
            Bills
          </Link>

          <button onClick={logout} style={{ marginLeft: "20px" }}>
            Logout
          </button>
        </nav>
      )}

      {/* ================= ROUTES ================= */}
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* ---------- PUBLIC ---------- */}
          <Route path="/login" element={<Login />} />

          {/* ---------- PROTECTED ---------- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerStatement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillHistory />
              </ProtectedRoute>
            }
          />

          {/* ---------- PRINT ROUTES (NO AUTH WRAP) ---------- */}
          <Route path="/print/:id" element={<PrintBill />} />
          <Route
            path="/print-statement/:customerId"
            element={<PrintCustomerStatement />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
