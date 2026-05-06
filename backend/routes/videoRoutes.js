const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Video = require("../models/Video");

// multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   🔑 SIGNATURE ROUTE
========================= */
router.get("/sign-upload", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "videos",
    },
    process.env.API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
  });
});

/* =========================
   📥 UPLOAD ROUTE
========================= */
// Updated to handle both direct file upload (if needed) and pre-uploaded metadata
router.post("/upload", upload.single("video"), async (req, res) => {
  console.log("Upload request received!");
  
  try {
    const { userName, videoUrl, publicId, folder,uploadDate,type } = req.body;
    
    // Case 1: File is already uploaded to Cloudinary by frontend
    if (videoUrl && publicId) {
      const video = new Video({
        userName: userName?.trim(),
        videoUrl,
        publicId,
        folder,
        uploadDate: uploadDate ? new Date(uploadDate) : undefined,
        type,
      });
      await video.save();
      return res.json(video);
    }

    // Case 2: Standard file upload (Backwards compatibility / small files)
    if (!userName || !req.file) {
      return res.status(400).json({ error: "Missing name or video file" });
    }

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: `videos/${userName.trim().replace(/\s+/g, "_")}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadToCloudinary();

    const video = new Video({
      userName: userName.trim(),
      videoUrl: result.secure_url,
      publicId: result.public_id,
      folder: result.folder,
    });

    await video.save();
    res.json(video);

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});



/* =========================
   📊 GET VIDEOS (ADD HERE 👇)
========================= */
// router.get("/videos", async (req, res) => {
//   try {
//     const videos = await Video.find();

//     console.log("VIDEOS FROM DB:", videos); // 👈 DEBUG LINE

//     const grouped = {};
//     videos.forEach((v) => {
//       if (!grouped[v.userName]) grouped[v.userName] = [];
//       grouped[v.userName].push(v);
//     });

//     res.json(grouped);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();

    const grouped = {};

    videos.forEach((v) => {
      const user = v.userName;
      const date = new Date(v.uploadDate).toISOString().split("T")[0]; // YYYY-MM-DD

      if (!grouped[user]) grouped[user] = {};
      if (!grouped[user][date]) grouped[user][date] = [];

      grouped[user][date].push(v);
    });

    res.json(grouped);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;