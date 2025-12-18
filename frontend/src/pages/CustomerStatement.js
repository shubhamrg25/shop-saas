import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function CustomerStatement() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [payAmounts, setPayAmounts] = useState({});

  /* ---------------- LOAD CUSTOMER LEDGER ---------------- */
  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/api/customers/?search=${search}`,
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));
  }, [search]);

  /* ---------------- PAY DUE (PER BILL) ---------------- */
  const payDue = async (billId) => {
    const amount = payAmounts[billId];

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    const res = await fetch(
      `http://127.0.0.1:8000/api/bill/${billId}/pay/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ amount }),
      }
    );

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Payment failed");
    }
  };

  /* ---------------- PRINT FULL STATEMENT ---------------- */
  const printStatement = (customerId) => {
    window.open(`/print-statement/${customerId}`, "_blank");
  };

  /* ---------------- PRINT SINGLE BILL ---------------- */
  const printBill = (billId) => {
    window.open(`/print/${billId}`, "_blank");
  };

  return (
    <div>
      <h2>Customer Statements</h2>

      <input
        placeholder="Search customer / mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "15px" }}
      />

      {customers.map((c) => (
        <div
          key={c.customer_id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "25px",
          }}
        >
          <h3>
            {c.customer_name} ({c.mobile || "No mobile"})
          </h3>

          <h4>Total Due: ₹{c.total_due}</h4>

          <button
            onClick={() => printStatement(c.customer_id)}
            style={{ marginBottom: "10px" }}
          >
            🖨 Print Statement
          </button>

          <table
            border="1"
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Pay Due</th>
                <th>Print</th>
              </tr>
            </thead>

            <tbody>
              {c.bills.map((b) => (
                <tr key={b.bill_id}>
                  <td>{b.bill_id}</td>
                  <td>{b.date}</td>
                  <td>₹{b.total}</td>
                  <td>₹{b.paid}</td>
                  <td>₹{b.due}</td>

                  <td>
                    {Number(b.due) > 0 ? (
                      <>
                        <input
                          type="number"
                          style={{ width: "80px" }}
                          value={payAmounts[b.bill_id] || ""}
                          onChange={(e) =>
                            setPayAmounts({
                              ...payAmounts,
                              [b.bill_id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => payDue(b.bill_id)}
                          style={{ marginLeft: "5px" }}
                        >
                          Pay
                        </button>
                      </>
                    ) : (
                      "✔ Cleared"
                    )}
                  </td>

                  <td>
                    <button onClick={() => printBill(b.bill_id)}>
                      🖨 Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default CustomerStatement;
