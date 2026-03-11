const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());

// Allow local only cors
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// Authorization
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: true, username: "aaron" });
});

// Uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route to receive link + files
app.post("/api/links", upload.fields([
  { name: "frontPhoto", maxCount: 1 },
  { name: "backPhoto", maxCount: 1 },
]), async (req, res) => {
  try {
    const { url, description } = req.body;
    const frontPhoto = req.files.frontPhoto?.[0]?.filename || null;
    const backPhoto = req.files.backPhoto?.[0]?.filename || null;

    // Construct JSON payload for FastAPI
    const payload = {
      username: "mockuser", // or get from session/auth
      url,
      description,
      photos: { front: frontPhoto, back: backPhoto },
    };

    // Send to FastAPI
    const response = await axios.post("http://fastapi:8000/links", payload);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save link" });
  }
});



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


app.listen(3000, "0.0.0.0", () => {
  console.log("Node API running on port 3000");
});