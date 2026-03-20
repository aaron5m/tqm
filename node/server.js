/*
 * Node will work with React/Vite dev mode
 *  AND with their build, which is served from the html folder in production
 * 
 * IMPORTANTLY
 *  ONLY calls through Node can actually ask FastAPI to alter the database.
 *  These calls are separated in this page of code, and visually distinct for the use of
 *   FASTAPI_URL, axios.post, *Notice
 * 
*/


const utils = require("./utils.js");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { fileTypeFromBuffer } = require("file-type");

const app = express();
app.use(express.json());
app.use(cookieParser());

const FASTAPI_URL = process.env.FASTAPI_URL;
const API_SECRET = process.env.API_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const VERIFICATION_REQUIRED = Number(process.env.VERIFICATION_REQUIRED); // 0 means not required

// Allow local/domain cors for nginx and React/Vite development
// const vitePassUrl = process.env.VITE_PASS_URL ? process.env.VITE_PASS_URL : "http://localhost";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  "http://localhost:80",
  "http://localhost:443",
  "http://localhost",
];
if (process.env.VITE_PASS_URL) {
  allowedOrigins.push(`${process.env.VITE_PASS_URL}:5173`);
  allowedOrigins.push(`${process.env.VITE_PASS_URL}:5174`);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
/*
app.use(cors({
  origin: ["http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:8080", 
    "http://localhost:80",
    "http://localhost:443",
    "http://localhost"],
  credentials: true,
}));
*/



// SIGNUP *Notice *alters database
app.post("/api/signup", async(req, res) => {
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

  // signup verification string for email verify
  const signup_verification_string = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verification_string = '';
    for (let i = 0; i < 20; i++) {
      verification_string += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return verification_string;
  };

  // send to FastAPI
  try {
    const response = await axios.post(`${FASTAPI_URL}/pyapi/signup`, 
      {
        username,
        email,
        password_input: hash,
        signup_verification: signup_verification_string()
      }, 
      { headers: { "X-API-KEY": API_SECRET }}
    );
    res.json({ message: "Signed up", fastapi: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// SIGNIN
app.post("/api/signin", async(req, res) => {
  const { username, password_input } = req.body;
  
  // validate
  if (!utils.isEightAlphanumerics(username) || !(await utils.isExistingUsername(username))) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (password_input.length < 8) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // ensure a verified user if in production ****
  if (VERIFICATION_REQUIRED) {
    try {
      const response = await fetch(`http://fastapi:8000/pyapi/get-verification?username=${username}`);
      if (!response.ok) return false;
      const data = await response.json();
      console.log(data);
      if (!data.verified) {
        res.status(401).json({ message: "Unverified" });
        return false;
      }
    } catch (err) {
    res.status(500).json({ message: "Server error" + err });
    return false;
    }
  }

  // hash and compare with db hash
  let match = false;
  try {
    const response = await fetch(`http://fastapi:8000/pyapi/get-hash?username=${username}`);
    if (!response.ok) return false;
    const data = await response.json();
    console.log(data);
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
    JWT_SECRET
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
app.post("/api/signout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: false,      
    sameSite: "lax",
  });

  res.status(200).json({ message: "Signed out" });
});


/*
// AUTHORIZE
app.post("/api/authorize", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.json({ loggedIn: false });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ loggedIn: true, username: payload.sub });
  } catch (e) {
    return res.json({ loggedIn: false });
  }
});
*/

// AUTHORIZE
app.post("/api/authorize", (req, res) => {
  const token = req.cookies.access_token;
  const result = authorize(token);
  return res.json(result);
});
const authorize = (token) => {
  if (!token) return { loggedIn: false };
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { loggedIn: true, username: payload.sub };
  } catch (e) {
    return { loggedIn: false };
  }
};



// UPLOAD *Notice *alters database
const htmlDir = "/app/html_images";
const viteDir = "/app/frontend_public_images";
const usefulDirs = [htmlDir, viteDir];
for (const tempDir of usefulDirs) {
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
}
const upload = multer({ storage: multer.memoryStorage() });

// route
app.post(
  "/api/upload",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req, res) => {
    if (!authorize(req.cookies.access_token).loggedIn) return false; // block unauthorized posts
    try {
      const { username, url, title, description } = req.body;
      // validate username, url, and description
      if (!utils.isEightAlphanumerics(username) || !(await utils.isExistingUsername(username))) {
        return res.status(401).json({ message: "Invalid username:" + username });
      }
      if (!url) return res.status(401).json({ error: "URL required" });
      try { new URL(url); } catch { return res.status(401).json({ error: "Invalid URL" }); }
      if (typeof title !== "string" || typeof description !== "string") {
        return res.status(401).json({ error: "Title and Description must be text" });
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
      const response = await axios.post(`${FASTAPI_URL}/pyapi/upload`, 
        {
          username,
          url,
          title,
          description,
          photos: processedFiles
        }, 
        { headers: { "X-API-KEY": API_SECRET }}
      );
      res.json(response.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save link: " + err.message });
    }
  }
);



// TESTING
app.get("/api/test", (req, res) => {
  res.json({ message: "Node API working" });
});



// LISTENER
app.listen(3000, "0.0.0.0", () => {
  console.log("Node API running on port 3000");
});


