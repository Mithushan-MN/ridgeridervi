import { useEffect, useState } from "react";
import api from "../api";
import { FolderOpen, Search, Video, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/videos")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🔹 filter users
  const filteredUsers = Object.keys(data).filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 FIXED: flatten + filter videos by date
  const filterVideosByDate = (userDates) => {
    // flatten all date arrays into one
    const allVideos = Object.values(userDates).flat();

    return allVideos.filter((v) => {
      if (!selectedDate) return true;

      const date = new Date(v.uploadDate).toISOString().split("T")[0];
      return date === selectedDate;
    });
  };

  // 🔹 total videos count
  const totalVideos = Object.values(data).reduce((acc, userDates) => {
    return acc + filterVideosByDate(userDates).length;
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* HEADER */}
      <div className="border-b border-zinc-800 p-6 flex justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen /> Admin Dashboard
        </h1>

        <div className="flex gap-6">
          <p><b>{Object.keys(data).length}</b> Users</p>
          <p><b>{totalVideos}</b> Videos</p>
        </div>
      </div>

      <div className="p-8">

        {/* FILTER BAR */}
        <div className="flex gap-4 mb-8">
          
          {/* SEARCH */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-zinc-400" />
            <input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-3 bg-zinc-900 border border-zinc-700 rounded-xl"
            />
          </div>

          {/* DATE PICKER */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl"
            />
          </div>

          {/* CLEAR BUTTON */}
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="px-4 py-3 bg-zinc-800 rounded-xl"
            >
              Clear
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredUsers.map((user) => {
              const videos = filterVideosByDate(data[user]);

              if (videos.length === 0) return null;

              return (
                <div key={user} className="bg-zinc-900 p-5 rounded-2xl">
                  
                  <h2 className="text-xl font-semibold">{user}</h2>
                  <p className="text-zinc-400 mb-4 flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    {videos.length} videos
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {videos.map((v) => (
                      <video
                        key={v._id}
                        src={v.videoUrl}
                        controls
                        className="rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredUsers.length === 0 && (
          <p className="text-center text-zinc-400 mt-10">
            No users found
          </p>
        )}
      </div>
    </div>
  );
}