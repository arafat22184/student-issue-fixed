"use client";
import React, { useEffect, useState } from "react";
import { User, Heart, Calendar, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { imageUpload } from "@/lib/imgUpload";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;
  const isPremium = user?.plan === "premium" || user?.isPremium;

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchUserLessons = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/user/public-lessons/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLessons(data || []);
      }
    } catch (err) {
      console.error("Lessons fetch error:", err);
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhotoUrl(user.image || "");
      fetchUserLessons();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const toastId = toast.loading("Updating profile...");

    try {
      let uploadedUrl = photoUrl;
      if (imageFile) {
        uploadedUrl = await imageUpload(imageFile); 
      }

      const tokenResult = await authClient.getAccessToken();
      const token = typeof tokenResult === 'string' ? tokenResult : (tokenResult?.accessToken || tokenResult?.token);

      if (!token) throw new Error("Authentication token missing");
      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, image: uploadedUrl })
      });

      if (res.ok) {
        toast.success("Profile updated!", { id: toastId });
        await refetch(); 
        setImageFile(null);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      toast.error("Failed to update profile", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return <div className="flex justify-center py-20 animate-pulse text-[#670D2F] font-bold">Loading...</div>;

  return (
    <div className="space-y-8 p-4">
      {/* Profile Overview */}
      <section className="bg-white rounded-3xl border shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="relative">
          <img src={user.image || "/default-avatar.png"} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#670D2F]/10" />
          {isPremium && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow">Premium ⭐</span>}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-[#670D2F]">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex gap-3 pt-2">
            <span className="bg-[#670D2F]/10 text-[#670D2F] px-4 py-1 rounded-full text-xs font-bold">{lessons.length} Public Lessons</span>
          </div>
        </div>
      </section>

      {/* Edit Form */}
      <section className="bg-white rounded-3xl border shadow-sm p-8">
        <h3 className="text-lg font-bold mb-6">Edit Profile Details</h3>
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Name" />
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded-xl" />
          <button disabled={updating} className="bg-[#670D2F] text-white py-3 rounded-xl font-bold flex gap-2 items-center justify-center">
            {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Lessons Grid */}
      <section>
        <h3 className="text-xl font-bold mb-6">My Public Lessons</h3>
        {loadingLessons ? <p>Loading...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lessons.map(item => (
                    <div key={item._id} className="bg-white p-6 rounded-3xl border shadow-sm">
                        <h4 className="font-bold text-[#670D2F] truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs font-bold text-pink-600">
                           <span>❤️ {item.likesCount || 0} Likes</span>
                           <Link href={`/lesson/${item._id}`} className="hover:underline flex items-center gap-1">Details <ExternalLink size={12} /></Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
}