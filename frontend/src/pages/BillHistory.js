import { useEffect, useState } from "react";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadBills = () => {
    fetch(
      `http://127.0.0.1:8000/api/bills/?search=${search}&page=${page}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBills(data.results || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(() => console.log("Failed to load bills"));
  };

  useEffect(() => {
    loadBills();
  }, [page]);

  return (
    <div>
      <h2>Bill History</h2>

      {/* Search */}
      <input
        placeholder="Search customer or mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={() => {
          setPage(1);
          loadBills();
        }}
      >
        Search
      </button>

      {/* Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Mobile</th>
            <th>Product</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan="9">No records found</td>
            </tr>
          ) : (
            bills.map((b, index) => (
              <tr key={b.id}>
                <td>{index + 1}</td>
                <td>{b.customer}</td>
                <td>{b.mobile}</td>
                <td>{b.product}</td>
                <td>₹{b.total_amount}</td>
                <td>₹{b.paid_amount}</td>
                <td>₹{b.due_amount}</td>
                <td>{b.payment_status}</td>
                <td>{b.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "10px" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
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
