import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => console.log("Failed to load dashboard"));
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h3>Today's Sales</h3>
          <p>₹ {stats.total_sales}</p>
        </div>

        <div>
          <h3>Today's Profit</h3>
          <p>₹ {stats.total_profit}</p>
        </div>

        <div>
          <h3>Total Due</h3>
          <p>₹ {stats.total_due}</p>
        </div>
      </div>

      <h3>Low Stock Alerts</h3>
      {stats.low_stock.length === 0 ? (
        <p>No low stock products</p>
      ) : (
        <ul>
          {stats.low_stock.map((p) => (
            <li key={p.id}>
              {p.name} — Stock: {p.stock}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
