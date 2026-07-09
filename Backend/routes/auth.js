const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const {
  memoryUsers,
  createMemoryUser,
  findMemoryUserByEmail,
  findMemoryUserById,
  updateMemoryUser
} = require("../utils/memoryUsers");

function buildUserResponse(user) {
  return {
    id: user._id || user.id,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    dateOfBirth: user.dateOfBirth || null,
    height: user.height || "",
    heightUnit: user.heightUnit || "cm",
    weight: user.weight || "",
    weightUnit: user.weightUnit || "kg",
    activityLevel: user.activityLevel || "",
    goals: user.goals || [],
    otherGoal: user.otherGoal || "",
    detailedGoals: Array.isArray(user.detailedGoals) ? user.detailedGoals : [],
    dietaryRequirements: user.dietaryRequirements || [],
    favoriteFoods: user.favoriteFoods || "",
    targetCalories: user.targetCalories || "",
    notes: user.notes || ""
  };
}

//
// 🟢 REGISTER
//
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const trimmedPassword = password.trim();
    const passwordIsValid = trimmedPassword.length >= 8 && /[0-9]/.test(trimmedPassword) && /[^A-Za-z0-9]/.test(trimmedPassword);
    if (!passwordIsValid) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and include a number and a special character." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).catch(() => null);
    if (existingUser || findMemoryUserByEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email already in use" });
    }

    let user;
    try {
      user = new User({ email: normalizedEmail, password });
      await user.save();
    } catch (err) {
      user = createMemoryUser({ email: normalizedEmail, password });
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

//
// 🔵 LOGIN (Passport session-based)
//
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  req.body.email = String(email).toLowerCase().trim();

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.json({
        message: "Login successful",
        user: buildUserResponse(user)
      });
    });
  })(req, res, next);
});

//
// 🟣 CURRENT USER (SESSION CHECK)
//
router.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }

  const userId = req.user._id || req.user.id;
  const user = await User.findById(userId).catch(() => null) || findMemoryUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    user: buildUserResponse(user)
  });
});

router.put("/profile", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const userId = req.user._id || req.user.id;
  let user = await User.findById(userId).catch(() => null) || findMemoryUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "height",
    "heightUnit",
    "weight",
    "weightUnit",
    "activityLevel",
    "goals",
    "otherGoal",
    "detailedGoals",
    "dietaryRequirements",
    "favoriteFoods",
    "targetCalories",
    "notes"
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      user[field] = req.body[field];
    }
  });

  if (user.save) {
    await user.save();
  } else {
    updateMemoryUser(userId, user);
  }

  res.json({
    message: "Profile updated successfully",
    user: buildUserResponse(user)
  });
});

//
// 🔴 LOGOUT
//
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;