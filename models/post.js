const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    content: { type: String, required: true, max: 500 },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("posts", Schema);
