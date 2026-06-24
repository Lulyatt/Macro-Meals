// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// ===============================
// GLOBAL STATE (CACHE / MEMORY)
// ===============================
let accessToken = null;
let tokenExpiry = 0;


// ===============================
// BASIC ROUTES (HEALTH CHECK)
// ===============================
app.get("/", (req, res) => {
  res.json({ message: "Macro Meals API is running" });
});


// ===============================
// AUTH: FATSECRET TOKEN HANDLER
// ===============================
// Handles OAuth 2.0 client credentials flow
// Gets + caches access token from FatSecret API

async function getAccessToken() {
  const now = Date.now();

  // reuse token if still valid
  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  const res = await axios.post(
    "https://oauth.fatsecret.com/connect/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      scope: "basic",
    }),
    {
      auth: {
        username: process.env.FATSECRET_CLIENT_ID,
        password: process.env.FATSECRET_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = res.data.access_token;
  tokenExpiry = now + res.data.expires_in * 1000;

  return accessToken;
}

 // ===============================
 // API ROUTES: FOOD SEARCH
 // ===============================

app.get("/foods/search", async (req, res) => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      "https://platform.fatsecret.com/rest/server.api",
      {
        params: {
          method: "foods.search",
          format: "json",
          search_expression: req.query.q,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log("FULL ERROR:");
  console.log(error.response?.data || error.message);

  res.status(500).json({
    error: "Food search failed",
    details: error.response?.data || error.message, });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});