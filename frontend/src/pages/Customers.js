import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentInputs, setPaymentInputs] = useState({});
  const [message, setMessage] = useState("");

  /* ---------------- LOAD CUSTOMERS ---------------- */
  const loadCustomers = () => {
    fetch(`http://127.0.0.1:8000/api/customers/?search=${search}`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setMessage("Failed to load customers"));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /* ---------------- HANDLE PAYMENT INPUT ---------------- */
  const handleAmountChange = (billId, value) => {
    setPaymentInputs({
      ...paymentInputs,
      [billId]: value,
    });
  };

  /* ---------------- PAY BILL DUE ---------------- */
  const payDue = async (billId) => {
    const amount = paymentInputs[billId];
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

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Payment failed");
      return;
    }

    setMessage("Payment successful");
    setPaymentInputs({});
    loadCustomers();
  };

  /* ---------------- UI ---------------- */
  return (
    <div>
      <h2>Customers</h2>

      {/* SEARCH */}
      <input
        placeholder="Search name or mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={loadCustomers}>Search</button>

      <hr />

      {customers.length === 0 && <p>No customers found</p>}

      {customers.map((c) => (
        <div
          key={c.customer_id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "15px",
          }}
        >
          <h3>
            {c.customer_name} ({c.mobile || "No Mobile"})
          </h3>

          <p>
            <b>Total Due:</b> ₹{c.total_due}
          </p>

          <button
            onClick={() =>
              window.open(`/print/customer/${c.customer_id}`, "_blank")
            }
          >
            🖨 Print Statement
          </button>

          <table
            border="1"
            cellPadding="6"
            style={{ width: "100%", marginTop: "10px" }}
          >
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Pay Due</th>
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
                          value={paymentInputs[b.bill_id] || ""}
                          onChange={(e) =>
                            handleAmountChange(
                              b.bill_id,
                              e.target.value
                            )
                          }
                        />
                        <button onClick={() => payDue(b.bill_id)}>
                          Pay
                        </button>
                      </>
                    ) : (
                      "✔ Cleared"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {message && <p>{message}</p>}
    </div>
  );
}

export default Customers;
