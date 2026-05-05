// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  userName: String,
  videoUrl: String,
  publicId: String,
  folder: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Video", videoSchema);