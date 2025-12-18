import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // Fetch products
  // -----------------------------
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/", {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        return res.json();
      })
      .then((data) => {
        // ✅ COMMERCIAL-SAFE HANDLING
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.results)) {
          setProducts(data.results);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        setError(err.message);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <div>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Selling Price</th>
              <th>GST %</th>
              <th>Stock</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.name}</td>
                <td>₹{p.selling_price}</td>
                <td>{p.gst_percent}%</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Products;
