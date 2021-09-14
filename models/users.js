const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: false },
    password: { type: String, required: true, min: 6, unique: false },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
  },
  { timestamps: true }
);
module.exports = mongoose.model("users", Schema);
