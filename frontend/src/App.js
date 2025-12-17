function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Shop SaaS Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>Today's Sales</h3>
          <p>₹ 0</p>
        </div>

        <div style={cardStyle}>
          <h3>Today's Profit</h3>
          <p>₹ 0</p>
        </div>

        <div style={cardStyle}>
          <h3>Products</h3>
          <p>0 Items</p>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <button style={btnStyle}>Create Bill</button>
        <button style={btnStyle}>View Products</button>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  width: "200px",
  borderRadius: "5px",
};

const btnStyle = {
  marginRight: "10px",
  padding: "10px 15px",
};

export default App;
