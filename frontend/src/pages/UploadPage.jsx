import { useState } from "react";
import api from "../api";
import { Upload, User, Video, ArrowRight, CheckCircle } from "lucide-react";
import rrvi from "../assets/rrvi.png";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [videos, setVideos] = useState([]); // ✅ multiple videos
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [uploadDate, setUploadDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      setVideos(files);
      setPreview(URL.createObjectURL(files[0])); // keep UI same
    }
  };

  const handleUpload = async () => {
    if (!name || videos.length === 0 || !uploadDate) {
      alert("Please enter your name, select date and videos");
      return;
    }

    setUploading(true);

    try {
      const { data: signData } = await api.get("/sign-upload");
      const { signature, timestamp, apiKey, cloudName } = signData;

      // 🔥 LOOP THROUGH ALL VIDEOS
      for (let i = 0; i < videos.length; i++) {
        const videoFile = videos[i];

        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(
              "POST",
              `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
            );

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);

                // 🔥 overall progress across all files
                const totalProgress = Math.round(
                  ((i + percent / 100) / videos.length) * 100
                );

                setProgress(totalProgress);
              }
            };

            xhr.onload = () => {
              const response = JSON.parse(xhr.response);

              if (xhr.status === 200) resolve(response);
              else reject(response);
            };

            xhr.onerror = () => reject("Upload failed");

            const formData = new FormData();
            formData.append("file", videoFile);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", "videos");

            xhr.send(formData);
          });
        };

        const uploadResult = await uploadToCloudinary();

        // save each video
        await api.post("/upload", {
          userName: name,
          videoUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          folder: uploadResult.folder,
          uploadDate: new Date(uploadDate),
        });
      }

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

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-10">
          {!success ? (
            <div className="space-y-8">

              {/* NAME */}
              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <User className="w-4 h-4" />
                  YOUR NAME
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg"
                />
              </div>

              {/* DATE */}
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

              {/* VIDEO */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 flex gap-2">
                  <Upload className="w-4 h-4" />
                  SELECT VIDEOS
                </label>

                <label className="border-2 border-dashed border-zinc-700 rounded-3xl p-10 flex justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {preview ? (
                    <video src={preview} controls className="w-full rounded-2xl" />
                  ) : (
                    <p className="text-zinc-400">Click to upload videos</p>
                  )}
                </label>

                {videos.length > 1 && (
                  <p className="text-sm text-zinc-500 mt-2">
                    {videos.length} videos selected
                  </p>
                )}
              </div>

              {/* PROGRESS */}
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

              {/* BUTTON */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-5 rounded-2xl flex justify-center items-center gap-2"
              >
                {uploading ? `Uploading ${progress}%...` : "Upload Videos"}
                {!uploading && <ArrowRight className="w-5 h-5" />}
              </button>

            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-3">Upload Successful!</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Thank you, <span className="text-white">{name}</span>
              </p>

              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setVideos([]);
                  setPreview(null);
                  setUploadDate(new Date().toISOString().split("T")[0]);
                }}
                className="px-8 py-4 bg-zinc-800 rounded-2xl"
              >
                Upload Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}