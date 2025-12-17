import { useEffect, useState } from "react";

function Billing() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
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
          product_id: productId,
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Server error");
      } else {
        setMessage(
          `Sale Successful! Total: ₹${data.total_amount}, Profit: ₹${data.profit}`
        );

        // Reset form
        setQuantity(1);
        setProductId("");
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

        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
            required
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
