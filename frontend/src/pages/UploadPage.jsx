import { useState } from "react";
import api from "../api";
import { Upload, User, Video, ArrowRight, CheckCircle } from "lucide-react";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!name || !video) {
      alert("Please enter your name and select a video");
      return;
    }

    setUploading(true);

    try {
      // 1. Get Signature from backend
      const { data: signData } = await api.get("/sign-upload");
      const { signature, timestamp, apiKey, cloudName } = signData;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", video);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "videos");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(uploadResult.error?.message || "Cloudinary upload failed");
      }

      // 3. Save metadata to backend
      await api.post("/upload", {
        userName: name,
        videoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder: uploadResult.folder,
      });

      setSuccess(true);
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
              <Video className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
            Share Your Moment
          </h1>
          <p className="text-zinc-400 text-lg">Upload videos effortlessly</p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-10">
          {!success ? (
            <div className="space-y-8">
              {/* Name Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                  <User className="w-4 h-4" />
                  YOUR NAME
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-6 py-4 text-lg outline-none transition-all placeholder:text-zinc-500"
                />
              </div>

              {/* Video Upload Area */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                  <Upload className="w-4 h-4" />
                  SELECT VIDEO
                </label>

                <label
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-violet-500 hover:bg-zinc-950/50 ${
                    preview ? "border-violet-500" : "border-zinc-700"
                  }`}
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {preview ? (
                    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden">
                      <video
                        src={preview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-lg font-medium">Drop your video here</p>
                      <p className="text-zinc-500 text-sm mt-1">MP4, MOV • Max 500MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !name || !video}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-700 disabled:to-zinc-700 py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                {uploading ? (
                  "Uploading Video..."
                ) : (
                  <>
                    Upload Video <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-3">Upload Successful!</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Thank you, <span className="text-white font-medium">{name}</span>
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setVideo(null);
                  setPreview(null);
                }}
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-medium transition"
              >
                Upload Another Video
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Videos are stored securely • Organized by your name
        </p>
      </div>
    </div>
  );
}