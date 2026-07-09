const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    firstName: {
      type: String,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    dateOfBirth: {
      type: Date
    },

    height: {
      type: Number
    },

    heightUnit: {
      type: String,
      enum: ["cm", "ft"],
      default: "cm"
    },

    weight: {
      type: Number
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lbs", "st"],
      default: "kg"
    },

    activityLevel: {
      type: String,
      trim: true
    },

    goals: [{
      type: String,
      trim: true
    }],

    otherGoal: {
      type: String,
      trim: true
    },

    detailedGoals: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      }
    }],

    dietaryRequirements: [{
      type: String,
      trim: true
    }],

    favoriteFoods: {
      type: String,
      trim: true
    },

    targetCalories: {
      type: Number
    },

    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

//
// 🔐 HASH PASSWORD BEFORE SAVING
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// 🔍 COMPARE PASSWORD METHOD
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);