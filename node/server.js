require("dotenv").config();
const utils = require("./utils.js");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow local only cors
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
  credentials: true,
}));


// SIGNUP
app.post("/signup", async(req, res) => {
  const { username, email, password_input } = req.body;
  
  // validate
  if (!(await utils.isNewValidUsername(username))) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!utils.isEmail(email)) {
    return res.status(401).json({ message: "Invalid email" });
  }
  if (!utils.isEightChars(password_input)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // hash
  const hash = await bcrypt.hash(password_input, 10); // 10 salt rounds

  // send to FastAPI
  try {
    const response = await fetch("http://fastapi:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password_input: hash
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json({ message: "Signed up", fastapi: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// SIGNIN
app.post("/signin", (req, res) => {
  const { username, password_input } = req.body;

  // validate credentials (omitted for brevity)
  if (username !== "test" || password_input !== "123") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: username, exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 }, // 1 week
    SECRET
  );

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: false,   // true if HTTPS
    sameSite: "lax",
    maxAge: 3600 * 1000 * 24 * 7
  });

  res.json({ message: "Logged in" });
});

// Authorization
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: true, username: "aaron" });
});

// UPLOADS
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