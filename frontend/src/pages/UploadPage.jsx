import { useState } from "react";
import api from "../api";
import { Upload, User, Video, ArrowRight, CheckCircle } from "lucide-react";
import rrvi from "../assets/rrvi.png";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]); // ✅ mixed files
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [uploadDate, setUploadDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    if (selected.length > 0) {
      setFiles(selected);
      setPreview(URL.createObjectURL(selected[0])); // keep UI same
    }
  };

  const handleUpload = async () => {
    if (!name || files.length === 0 || !uploadDate) {
      alert("Please fill all fields");
      return;
    }

    setUploading(true);

    try {
      const { data: signData } = await api.get("/sign-upload");
      const { signature, timestamp, apiKey, cloudName } = signData;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const isVideo = file.type.startsWith("video");
        const resourceType = isVideo ? "video" : "image";

        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(
              "POST",
              `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
            );

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);

                const totalProgress = Math.round(
                  ((i + percent / 100) / files.length) * 100
                );

                setProgress(totalProgress);
              }
            };

            xhr.onload = () => {
              const res = JSON.parse(xhr.response);
              if (xhr.status === 200) resolve(res);
              else reject(res);
            };

            xhr.onerror = () => reject("Upload failed");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", "videos");

            xhr.send(formData);
          });
        };

        const result = await uploadToCloudinary();

        await api.post("/upload", {
          userName: name,
          videoUrl: result.secure_url,
          publicId: result.public_id,
          folder: result.folder,
          uploadDate: new Date(uploadDate),
          type: resourceType, // ✅ IMPORTANT
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40 flex items-center justify-center">
              <Video className="w-10 h-10" />
              <img src={rrvi} alt="" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">Share Your Moment</h1>
          <p className="text-zinc-400">Upload videos & images</p>
        </div>

        <div className="bg-zinc-900 p-10 rounded-3xl">

          {!success ? (
            <div className="space-y-8">

              {/* NAME */}
              <input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-zinc-800 rounded-xl"
              />

              {/* DATE */}
              <input
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full p-4 bg-zinc-800 rounded-xl"
              />

              {/* FILE INPUT */}
              <label className="border-2 border-dashed p-10 block text-center cursor-pointer rounded-xl">
                <input
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {preview ? (
                  files[0]?.type.startsWith("video") ? (
                    <video src={preview} controls />
                  ) : (
                    <img src={preview} alt="" className="rounded-xl" />
                  )
                ) : (
                  <p>Select Images or Videos</p>
                )}
              </label>

              {/* COUNT */}
              {files.length > 0 && (
                <p className="text-sm text-zinc-400">
                  {files.length} files selected
                </p>
              )}

              {/* PROGRESS */}
              {uploading && (
                <div className="w-full bg-zinc-800 h-3 rounded-full">
                  <div
                    className="bg-violet-500 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* BUTTON */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-4 bg-violet-600 rounded-xl"
              >
                {uploading ? `Uploading ${progress}%` : "Upload Files"}
              </button>

            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl mt-4">Upload Successful</h2>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}