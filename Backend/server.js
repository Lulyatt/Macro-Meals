const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const requiredEnv = [
  "MONGO_URI",
  "SESSION_SECRET",
  "FATSECRET_CLIENT_ID",
  "FATSECRET_CLIENT_SECRET"
];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const axios = require("axios");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
require("./config/passport");

const app = express();

// ===============================
// DEBUG ENV
// ===============================
console.log("ENV TEST:", process.env.MONGO_URI);
console.log("MONGO_URI RAW:", process.env.MONGO_URI);

// ===============================
// MONGO DB CONNECT
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
  })
);
app.use(express.json());

// ===============================
// SESSION (MUST BE BEFORE ROUTES)
// ===============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ===============================
// PASSPORT (MUST COME AFTER SESSION)
// ===============================
app.use(passport.initialize());
app.use(passport.session());

// ===============================
// ROUTES
// ===============================
app.use("/auth", authRoutes);

// ===============================
const PORT = process.env.PORT || 5000;

// ===============================
// GLOBAL STATE (FatSecret token cache)
// ===============================
let accessToken = null;
let tokenExpiry = 0;

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.json({ message: "Macro Meals API is running" });
});

// ===============================
// FATSECRET TOKEN HANDLER
// ===============================
async function getAccessToken() {
  const now = Date.now();

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
// FOOD SEARCH ROUTE
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
      details: error.response?.data || error.message,
    });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});