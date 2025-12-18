import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [payInputs, setPayInputs] = useState({});

  const fetchBills = () => {
    fetch(
      `http://127.0.0.1:8000/api/bills/?search=${search}&page=${page}`,
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setBills(data.results || []);
        setTotalPages(data.total_pages || 1);
      });
  };

  useEffect(() => {
    fetchBills();
  }, [page]);

  /* ---------------- PAY DUE ---------------- */
  const payDue = async (billId) => {
    const amount = payInputs[billId];
    if (!amount || Number(amount) <= 0) return;

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
      setPayInputs({ ...payInputs, [billId]: "" });
      fetchBills();
    }
  };

  return (
    <div>
      <h2>Bill History</h2>

      {/* SEARCH */}
      <input
        placeholder="Search Bill / Customer / Mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={() => {
          setPage(1);
          fetchBills();
        }}
      >
        Search
      </button>

      <table border="1" cellPadding="8" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Customer</th>
            <th>Mobile</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan="7">No records found</td>
            </tr>
          ) : (
            bills.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.customer || "Walk-in"}</td>
                <td>{b.mobile || "-"}</td>

                {/* ✅ FORCE STRING → NUMBER SAFE */}
                <td>₹{Number(b.total_amount || 0).toFixed(2)}</td>
                <td>₹{Number(b.paid_amount || 0).toFixed(2)}</td>
                <td>₹{Number(b.due_amount || 0).toFixed(2)}</td>

                <td>
                  {Number(b.due_amount) <= 0 ? (
                    "✔ Paid"
                  ) : (
                    <>
                      <input
                        type="number"
                        style={{ width: "80px" }}
                        value={payInputs[b.id] || ""}
                        onChange={(e) =>
                          setPayInputs({
                            ...payInputs,
                            [b.id]: e.target.value,
                          })
                        }
                      />
                      <button onClick={() => payDue(b.id)}>Pay</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div style={{ marginTop: "10px" }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default BillHistory;
