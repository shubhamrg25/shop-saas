import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [message, setMessage] = useState("");

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/", {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  }, []);

  /* ---------------- SEARCH ---------------- */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- ADD ITEM ---------------- */
  const addItem = () => {
    if (!selectedProduct) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setMessage("Enter valid quantity");
      return;
    }

    const rate = Number(selectedProduct.selling_price);

    setItems((prev) => {
      const index = prev.findIndex(
        (i) => i.product_id === selectedProduct.id
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index].quantity =
          Number(updated[index].quantity) + qty;
        updated[index].line_total =
          updated[index].quantity * updated[index].rate;
        return updated;
      }

      return [
        ...prev,
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          unit: selectedProduct.unit,
          rate: rate,
          quantity: qty,
          line_total: qty * rate,
        },
      ];
    });

    setSearch("");
    setQuantity("");
    setSelectedProduct(null);
    setShowList(false);
    setMessage("");
  };

  /* ---------------- CHANGE QTY ---------------- */
  const changeQty = (index, delta) => {
    setItems((prev) => {
      const updated = [...prev];
      const newQty =
        Number(updated[index].quantity) + Number(delta);

      if (newQty <= 0) {
        updated.splice(index, 1); // ✅ REMOVE ITEM
      } else {
        updated[index].quantity = newQty;
        updated[index].line_total =
          newQty * updated[index].rate;
      }

      return updated;
    });
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- TOTALS ---------------- */
  const total = items.reduce(
    (sum, item) => sum + Number(item.line_total),
    0
  );
  const due = total - Number(paidAmount || 0);

  /* ---------------- GENERATE BILL ---------------- */
  const generateBill = async () => {
    if (items.length === 0) {
      setMessage("Add items to bill");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/bill/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({
        customer_name: customerName,
        customer_mobile: customerMobile,
        paid_amount: Number(paidAmount || 0),
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Billing failed");
      return;
    }

    window.open(`/print/${data.bill_id}`, "_blank");

    setItems([]);
    setCustomerName("");
    setCustomerMobile("");
    setPaidAmount("");
    setMessage("Bill generated successfully");
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <h2>Billing</h2>

      {/* CUSTOMER */}
      <input
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <input
        placeholder="Mobile Number"
        value={customerMobile}
        onChange={(e) => setCustomerMobile(e.target.value)}
      />

      <hr />

      {/* SEARCH PRODUCT */}
      <input
        placeholder="Search product"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowList(true);
        }}
      />

      {showList && search && (
        <div style={{ border: "1px solid #ccc" }}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{ padding: "6px", cursor: "pointer" }}
              onClick={() => {
                setSelectedProduct(p);
                setSearch(p.name);
                setShowList(false);
              }}
            >
              {p.name} — ₹{p.selling_price}/{p.unit}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <>
          <input
            type="number"
            step="0.001"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button onClick={addItem}>Add Item</button>
        </>
      )}

      <hr />

      {/* ITEMS */}
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span>{item.name}</span>
          <span>₹{item.rate}/{item.unit}</span>

          <div>
            <button onClick={() => changeQty(i, -0.5)}>-</button>
            <span style={{ margin: "0 8px" }}>
              {item.quantity}
            </span>
            <button onClick={() => changeQty(i, 0.5)}>+</button>
          </div>

          <span>₹{item.line_total.toFixed(2)}</span>
          <button onClick={() => removeItem(i)}>❌</button>
        </div>
      ))}

      <hr />

      <h3>Total: ₹{total.toFixed(2)}</h3>

      <input
        placeholder="Paid Amount"
        value={paidAmount}
        onChange={(e) => setPaidAmount(e.target.value)}
      />

      <h4>Due: ₹{due.toFixed(2)}</h4>

      <button onClick={generateBill}>Generate Bill</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Billing;
