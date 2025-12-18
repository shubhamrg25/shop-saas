import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../utils/auth";

function PrintBill() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/bill/${id}/`, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBill(data);

        // 🔥 AUTO PRINT
        setTimeout(() => {
          window.print();
          window.close();
        }, 500);
      });
  }, [id]);

  if (!bill) return null;

  return (
    <div style={styles.bill}>
      {/* HEADER */}
      <h3 style={styles.center}>{bill.shop}</h3>
      <p style={styles.center}>
        A01, Akshat Plaza, Jaipur<br />
        Rajasthan – 300101<br />
        Phone: +91XXXXXXXXXX
      </p>

      <hr />

      <div style={styles.row}>
        <span>{bill.date}</span>
        <span>Bill #{bill.id}</span>
      </div>

      <hr />

      {/* CUSTOMER */}
      <p>
        <b>Customer:</b> {bill.customer_name || "Walk-in"}
      </p>
      {bill.customer_mobile && (
        <p>
          <b>Mobile:</b> {bill.customer_mobile}
        </p>
      )}

      <hr />

      {/* ITEMS HEADER */}
      <div style={styles.headerRow}>
        <span style={{ width: "40%" }}>Item</span>
        <span style={{ width: "20%", textAlign: "right" }}>Rate</span>
        <span style={{ width: "20%", textAlign: "right" }}>Qty</span>
        <span style={{ width: "20%", textAlign: "right" }}>Amt</span>
      </div>

      <hr />

      {/* ITEMS */}
      {bill.items.map((item, i) => (
        <div key={i} style={styles.itemRow}>
          <span style={{ width: "40%" }}>{item.name}</span>

          <span style={{ width: "20%", textAlign: "right" }}>
            ₹{item.rate}/{item.unit}
          </span>

          <span style={{ width: "20%", textAlign: "right" }}>
            {item.qty}
          </span>

          <span style={{ width: "20%", textAlign: "right" }}>
            ₹{item.line_total.toFixed(2)}
          </span>
        </div>
      ))}

      <hr />

      {/* TOTALS */}
      <div style={styles.row}>
        <span>Total</span>
        <span>₹{bill.total.toFixed(2)}</span>
      </div>

      <div style={styles.row}>
        <span>Paid</span>
        <span>₹{bill.paid.toFixed(2)}</span>
      </div>

      <div style={styles.row}>
        <span>Due</span>
        <span>₹{bill.due.toFixed(2)}</span>
      </div>

      <hr />

      <p style={styles.center}>🙏 Thank You 🙏</p>
      <p style={styles.center}>Visit Again</p>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  bill: {
    width: "80mm",
    fontSize: "12px",
    padding: "6px",
    fontFamily: "monospace",
  },
  center: {
    textAlign: "center",
    margin: "2px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2px 0",
  },
  headerRow: {
    display: "flex",
    fontWeight: "bold",
    fontSize: "11px",
  },
  itemRow: {
    display: "flex",
    fontSize: "11.5px",
    marginBottom: "2px",
  },
};

export default PrintBill;
