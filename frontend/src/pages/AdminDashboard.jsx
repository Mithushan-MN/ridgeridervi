// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";
import { Users, Video, FolderOpen, Search } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/videos").then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Filter users based on search
  const filteredUsers = Object.keys(data).filter((userName) =>
    userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = Object.keys(data).length;
  const totalVideos = Object.values(data).reduce((acc, videos) => acc + videos.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-zinc-400">Manage All Uploaded Videos</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-4xl font-bold text-violet-400">{totalUsers}</p>
              <p className="text-sm text-zinc-400">Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-fuchsia-400">{totalVideos}</p>
              <p className="text-sm text-zinc-400">Videos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 pl-14 py-4 rounded-2xl text-lg focus:border-violet-500 outline-none transition"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredUsers.map((userName) => {
              const videos = data[userName];
              return (
                <div
                  key={userName}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden hover:border-violet-500/50 transition-all duration-300"
                >
                  {/* User Header */}
                  <div className="p-6 flex items-center gap-4 border-b border-zinc-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold">{userName}</h3>
                      <p className="text-zinc-500 flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {videos.length} videos
                      </p>
                    </div>
                  </div>

                  {/* Videos Section */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {videos.slice(0, 4).map((v) => (
                        <div
                          key={v._id}
                          className="aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-700 hover:border-violet-500 transition"
                        >
                          <video
                            src={v.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {videos.length > 4 && (
                      <p className="text-center text-zinc-500 text-sm mt-4">
                        +{videos.length - 4} more videos in this folder
                      </p>
                    )}

                    {videos.length === 0 && (
                      <p className="text-center text-zinc-500 py-8">No videos yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-20 text-zinc-400 text-xl">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}