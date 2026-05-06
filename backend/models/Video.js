  // models/Video.js
  const mongoose = require("mongoose");

  const videoSchema = new mongoose.Schema({
    userName: String,
    videoUrl: String,
    publicId: String,
    folder: String,

    type: {
    type: String,
    enum: ["video", "image"],
    default: "video",
  },

  uploadDate: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  });

  module.exports = mongoose.model("Video", videoSchema);