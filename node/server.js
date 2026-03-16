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
const { fileTypeFromBuffer } = require("file-type");

const app = express();
app.use(express.json());
app.use(cookieParser());

// HELPERS AT BOTTOM

// Allow local only cors
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
  credentials: true,
}));



// SIGNUP
app.post("/signup", async(req, res) => {
  const { username, email, password_input } = req.body;
  
  // validate
  if (!utils.isEightAlphanumerics(username) || !(await utils.isNewUsername(username))) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!utils.isEmail(email)) {
    return res.status(401).json({ message: "Invalid email" });
  }
  if (password_input.length < 8) {
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
app.post("/signin", async(req, res) => {
  const { username, password_input } = req.body;
  
  // validate
  if (!utils.isEightAlphanumerics(username) || !(await utils.isExistingUsername(username))) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (password_input.length < 8) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // hash and compare with db hash
  let match = false;
  try {
    const response = await fetch(`http://fastapi:8000/get-hash?username=${username}`);
    if (!response.ok) return false;
    const data = await response.json();
    const storedHash = data.hash;
    if (!storedHash) return false;
    match = await bcrypt.compare(password_input, storedHash);
  } catch (err) {
    res.status(500).json({ message: "Server error" + err });
    return false;
  }
  if (!match) {
    res.status(401).json({ message: "Invalid password" });
    return false;
  }

  const token = jwt.sign(
    { sub: username, exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 }, // 1 week
    SECRET
  );

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: false, // only localhost talks to node
    sameSite: "lax",  // but localhost is outside container
    maxAge: 3600 * 1000 * 24 * 7
  });

  res.status(200).json({ message: "Signed in" });
});



// SIGNOUT
app.post("/signout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: false,      
    sameSite: "lax",
  });

  res.status(200).json({ message: "Signed out" });
});



// AUTHORIZE
app.post("/authorize", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.json({ loggedIn: false });
  try {
    const payload = jwt.verify(token, SECRET);
    return res.json({ loggedIn: true, username: payload.sub });
  } catch (e) {
    return res.json({ loggedIn: false });
  }
});



// UPLOAD
const htmlDir = "/app/html_images";
const viteDir = "/app/frontend_public_images";
const usefulDirs = [htmlDir, viteDir];
for (const tempDir of usefulDirs) {
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
}
const upload = multer({ storage: multer.memoryStorage() });

// route
app.post(
  "/upload",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { username, url, description } = req.body;
      // validate username, url, and description
      if (!utils.isEightAlphanumerics(username) || !(await utils.isExistingUsername(username))) {
        return res.status(401).json({ message: "Invalid username:" + username });
      }
      if (!url) return res.status(401).json({ error: "URL required" });
      try { new URL(url); } catch { return res.status(401).json({ error: "Invalid URL" }); }
      if (!description || typeof description !== "string") {
        return res.status(401).json({ error: "Description required and must be text" });
      }

      // validate images
      const processedFiles = {};
      for (const fieldName of ["front", "back"]) {
        const file = req.files[fieldName]?.[0];
        if (!file) return res.status(401).json({ error: "Image required" });
        const type = await fileTypeFromBuffer(file.buffer);
        if (!type || !type.mime.startsWith("image/")) {
          return res.status(400).json({ error: `${fieldName} is not a valid image` });
        }
        // generate filename and write to disk
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${file.originalname}`.replace(/\s+/g, "");
        for (const tempDir of usefulDirs) {
          fs.writeFileSync(path.join(tempDir, filename), file.buffer);
        }
        processedFiles[fieldName] = filename;
      }

      // handoff to fastapi
      const payload = {
        username,
        url,
        description,
        photos: processedFiles,
      };
      const response = await axios.post("http://fastapi:8000/upload", payload);
      res.json(response.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save link: " + err.message });
    }
  }
);



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


