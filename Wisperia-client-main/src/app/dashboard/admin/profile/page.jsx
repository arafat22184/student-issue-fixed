"use client";
import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { imageUpload } from "@/lib/imgUpload";
import { User, ShieldAlert, RefreshCw, Activity, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  useEffect(() => {
    if (!isPending) {
      if (!session || session.user.role !== "admin") {
        router.push("/dashboard");
      } else {
        setName(session.user.name || "");
        setPhotoUrl(session.user.image || "");
      }
    }
  }, [session, isPending, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const toastId = toast.loading("Updating administrator profile...");

    try {
      let finalPhotoUrl = photoUrl;
      if (imageFile) {
        finalPhotoUrl = await imageUpload(imageFile);
      }

      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, image: finalPhotoUrl })
      });

      if (res.ok) {
        toast.success("Admin profile updated successfully!", { id: toastId });
        setImageFile(null);
        refetch();
      } else {
        toast.error("Failed to update profile", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#670D2F] dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white">Admin Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your platform administrator credentials.</p>
      </header>

      {/* Admin Stats Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-[2rem] text-white shadow-lg">
          <Activity className="mb-2 w-6 h-6 text-red-200" />
          <p className="text-red-200 text-xs font-bold uppercase">Total Mod Actions</p>
          <h4 className="text-3xl font-black mt-1">42</h4>
        </div>
        <div className="card-theme p-6 rounded-[2rem] shadow-sm">
          <AlertCircle className="mb-2 w-6 h-6 text-[#670D2F] dark:text-white" />
          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase">Pending Reports</p>
          <h4 className="text-3xl font-black mt-1 text-[#670D2F] dark:text-white">03</h4>
        </div>
        <div className="card-theme p-6 rounded-[2rem] shadow-sm">
          <Clock className="mb-2 w-6 h-6 text-gray-400" />
          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase">Last Login</p>
          <h4 className="text-lg font-bold mt-2 text-gray-700 dark:text-gray-300">June 23, 2026</h4>
        </div>
      </section>

      {/* Profile Overview */}
      <section className="card-theme rounded-[2.5rem] shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="relative">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-red-950/20 dark:border-white/10" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 border-4 border-gray-200 dark:border-white/10">
              <User className="w-12 h-12" />
            </div>
          )}
          <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-red-900 text-white font-extrabold text-[10px] px-3 py-1 rounded-full border-2 border-white dark:border-[#450117] shadow flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> ADMIN
          </span>
        </div>
        <div className="flex-1 text-center md:text-left space-y-3">
          <h2 className="text-3xl font-extrabold text-[#670D2F] dark:text-white">{user?.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-block bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-1 rounded-full text-xs font-bold border border-red-100 dark:border-red-500/20">
            System Administrator
          </span>
        </div>
      </section>

      {/* Edit Form */}
      <section className="card-theme rounded-[2.5rem] shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Modify Settings</h3>
        <form onSubmit={handleUpdate} className="space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Display Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-xl outline-none focus:border-[#670D2F] dark:focus:border-white transition text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              disabled 
              value={user?.email || ""} 
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Photo URL</label>
            <input 
              type="text" 
              value={photoUrl} 
              onChange={(e) => setPhotoUrl(e.target.value)} 
              className="w-full p-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-xl outline-none focus:border-[#670D2F] dark:focus:border-white transition text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Upload New Avatar</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImageFile(e.target.files)} 
              className="w-full p-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none cursor-pointer text-sm" 
            />
          </div>
          <button 
            type="submit" 
            disabled={updating} 
            className="bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
}