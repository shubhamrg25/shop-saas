import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../utils/auth";

function PrintCustomerStatement() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/api/customers/${customerId}/statement/`,
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data);
        setLoading(false);

        // ✅ PRINT AFTER DATA LOAD
        setTimeout(() => {
          window.print();
        }, 500);
      });
  }, [customerId]);

  if (loading || !customer) {
    return <p>Loading statement...</p>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>{customer.customer_name}</h2>
      <p>Mobile: {customer.mobile}</p>
      <h3>Total Due: ₹{customer.total_due}</h3>

      <hr />

      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {customer.bills.map((b) => (
            <tr key={b.bill_id}>
              <td>{b.bill_id}</td>
              <td>{b.date}</td>
              <td>₹{b.total}</td>
              <td>₹{b.paid}</td>
              <td>₹{b.due}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "20px" }}>
        Printed on: {new Date().toLocaleString()}
      </p>
    </div>
  );
}

export default PrintCustomerStatement;
