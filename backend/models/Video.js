  // models/Video.js
  const mongoose = require("mongoose");

  const videoSchema = new mongoose.Schema({
    userName: String,
    videoUrl: String,
    publicId: String,
    folder: String,

    uploadDate: {
      type: Date,
      default: Date.now, // fallback if frontend doesn't send
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model("Video", videoSchema);