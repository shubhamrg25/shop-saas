import { useEffect, useState } from "react";

function Billing() {
  const [products, setProducts] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load products
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setMessage("Failed to load products"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sale/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_mobile: customerMobile,
          product_id: productId,
          quantity: Number(quantity),
          paid_amount: Number(paidAmount),
          due_date: dueDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Server error");
      } else {
        setMessage(
          `Sale Successful! Total: ₹${data.total_amount}, Paid: ₹${data.paid_amount}, Due: ₹${data.due_amount}`
        );

        // Reset form
        setCustomerName("");
        setCustomerMobile("");
        setProductId("");
        setQuantity(1);
        setPaidAmount(0);
        setDueDate("");
      }
    } catch (error) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Billing</h2>

      <form onSubmit={handleSubmit}>
        {/* Customer Info */}
        <div>
          <label>Customer Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Mobile Number:</label>
          <input
            type="text"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
          />
        </div>

        {/* Product */}
        <div>
          <label>Product:</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Select</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        {/* Payment */}
        <div>
          <label>Paid Amount:</label>
          <input
            type="number"
            min="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
        </div>

        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Generate Bill"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Billing;

