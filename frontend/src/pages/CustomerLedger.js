import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function CustomerLedger() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = () => {
    setLoading(true);
    fetch(
      `http://127.0.0.1:8000/api/customers/?search=${search}`,
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load customers");
        return res.json();
      })
      .then((data) => {
        setCustomers(data.results || []);
        setError("");
      })
      .catch(() => {
        setError("Unable to load customer ledger");
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  if (loading) return <p>Loading customer ledger...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Customer Ledger</h2>

      {/* SEARCH */}
      <input
        placeholder="Search by name or mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={loadCustomers}>Search</button>

      <hr />

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Total Bills</th>
              <th>Total Purchase</th>
              <th>Total Paid</th>
              <th>Total Due</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, index) => (
              <tr key={c.id}>
                <td>{index + 1}</td>
                <td>{c.name}</td>
                <td>{c.mobile || "-"}</td>
                <td>{c.total_bills}</td>
                <td>₹{Number(c.total_amount).toFixed(2)}</td>
                <td>₹{Number(c.total_paid).toFixed(2)}</td>
                <td
                  style={{
                    color: Number(c.total_due) > 0 ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  ₹{Number(c.total_due).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerLedger;
