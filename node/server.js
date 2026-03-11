const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Example route calling FastAPI
app.get("/api/predict", async (req, res) => {
  try {
    const response = await axios.get("http://fastapi:8000/predict");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Node API working" });
});

app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: true, username: "aaron" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Node API running on port 3000");
});