import express from "express";
import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const oauth = OAuth({
  consumer: {
    key: process.env.FATSECRET_KEY,
    secret: process.env.FATSECRET_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

// Example: search foods
app.get("/api/search", async (req, res) => {
  const query = req.query.q;

  const request_data = {
    url: "https://platform.fatsecret.com/rest/server.api",
    method: "GET",
    data: {
      method: "foods.search",
      search_expression: query,
      format: "json",
    },
  };

  const authHeader = oauth.toHeader(
    oauth.authorize(request_data)
  );

  try {
    const response = await axios.get(request_data.url, {
      params: request_data.data,
      headers: {
        Authorization: authHeader["Authorization"],
      },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));