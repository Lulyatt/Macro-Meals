const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const memoryUsers = [];

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  try {
    return await User.findOne({ email: normalizedEmail });
  } catch (err) {
    return memoryUsers.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
  }
}

async function findUserById(id) {
  try {
    return await User.findById(id);
  } catch (err) {
    return memoryUsers.find((user) => user.id === id) || null;
  }
}

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await findUserByEmail(email);

        if (!user) return done(null, false);

        const isMatch = user.comparePassword
          ? await user.comparePassword(password)
          : user.password === password;

        if (!isMatch) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id || user._id || user.email);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = { passport, memoryUsers };