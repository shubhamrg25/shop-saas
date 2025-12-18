import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function Dashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [lowStock, setLowStock] = useState([]); // ✅ FIXED

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/", {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTotalSales(data.total_sales || 0);
        setTotalProfit(data.total_profit || 0);
        setTotalDue(data.total_due || 0);
        setLowStock(data.low_stock || []); // ✅ SAFE
      })
      .catch(() => console.log("Dashboard load failed"));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Total Sales Today: ₹{totalSales}</p>
      <p>Total Profit Today: ₹{totalProfit}</p>
      <p>Total Due Amount: ₹{totalDue}</p>

      <h3>Low Stock Products</h3>

      {lowStock.length === 0 ? (
        <p>No low stock items 🎉</p>
      ) : (
        <ul>
          {lowStock.map((p) => (
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
