import { useState } from "react";
import api from "../api";
import { Upload, User, Video, ArrowRight, CheckCircle } from "lucide-react";
import rrvi from "../assets/rrvi.png";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ date state
  const [uploadDate, setUploadDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ✅ NEW: progress state
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!name || !video || !uploadDate) {
      alert("Please enter your name, select date and video");
      return;
    }

    setUploading(true);

    try {
      // 1. Get signature
      const { data: signData } = await api.get("/sign-upload");
      const { signature, timestamp, apiKey, cloudName } = signData;

      // 2. Upload with progress (XMLHttpRequest)
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
          );

          // 🔥 progress tracking
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            const response = JSON.parse(xhr.response);

            if (xhr.status === 200) {
              resolve(response);
            } else {
              reject(response);
            }
          };

          xhr.onerror = () => reject("Upload failed");

          const formData = new FormData();
          formData.append("file", video);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);
          formData.append("folder", "videos");

          xhr.send(formData);
        });
      };

      const uploadResult = await uploadToCloudinary();

      // 3. Save metadata
      await api.post("/upload", {
        userName: name,
        videoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder: uploadResult.folder,
        uploadDate: new Date(uploadDate),
      });

      setSuccess(true);
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40 rounded-2xl flex items-center justify-center">
              <Video className="w-10 h-10 text-white" />
              <img src={rrvi} alt="" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
            Share Your Moment
          </h1>
          <p className="text-zinc-400 text-lg">Upload videos effortlessly</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-10">
          {!success ? (
            <div className="space-y-8">

              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <User className="w-4 h-4" />
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  📅 DATE
                </label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4"
                />
              </div>

              {/* Video */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 flex gap-2">
                  <Upload className="w-4 h-4" />
                  SELECT VIDEO
                </label>

                <label className="border-2 border-dashed border-zinc-700 rounded-3xl p-10 flex justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {preview ? (
                    <video src={preview} controls className="w-full rounded-2xl" />
                  ) : (
                    <p className="text-zinc-400">Click to upload</p>
                  )}
                </label>
              </div>

              {/* 🔥 Progress Bar */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-5 rounded-2xl flex justify-center items-center gap-2"
              >
                {uploading ? `Uploading ${progress}%...` : "Upload Video"}
                {!uploading && <ArrowRight className="w-5 h-5" />}
              </button>

            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl">Upload Successful!</h2>
               <p className="text-zinc-400 text-lg mb-8">
                Thank you, <span className="text-white font-medium">{name}</span>
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setVideo(null);
                  setPreview(null);
                  setUploadDate(new Date().toISOString().split("T")[0]); // reset date
                }}
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-medium transition"
              >
                Upload Another Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}