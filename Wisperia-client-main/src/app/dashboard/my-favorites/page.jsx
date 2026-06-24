"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { Trash2, Calendar, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];
const TONES = ["All", "Motivational", "Sad", "Realization", "Gratitude"];

export default function MyFavoritesPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 

  // Filter States
  const [category, setCategory] = useState("All");
  const [emotionalTone, setEmotionalTone] = useState("All");

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchFavorites = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFavorites(data || []);
    } catch (err) {
      toast.error("Failed to load your favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((fav) => {
      const matchesCategory = category === "All" || fav.category === category;
      const tone = fav.emotionalTone || fav.emotionaltone;
      const matchesTone = emotionalTone === "All" || tone === emotionalTone;
      return matchesCategory && matchesTone;
    });
  }, [favorites, category, emotionalTone]);

  const removeFavorite = async (lessonId) => {
    setActionLoading(lessonId);
    const toastId = toast.loading("Removing...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId })
      });

      if (res.ok) {
        toast.success("Removed from Favorites!", { id: toastId });
        setFavorites(prev => prev.filter(f => f._id !== lessonId));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to remove", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#670D2F]" /></div>
  );

  return (
    <div className="space-y-8 p-4">
      <header>
        <h1 className="text-3xl font-extrabold text-[#670D2F]">My Favorites</h1>
        <p className="text-gray-500 text-sm mt-1">Wisdom insights you have saved for reflection.</p>
      </header>

      {/* Filter Section */}
      <section className="bg-white rounded-3xl p-6 border shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 text-sm outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Emotional Tone</label>
          <select value={emotionalTone} onChange={(e) => setEmotionalTone(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 text-sm outline-none">
            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center text-gray-400">
          {favorites.length === 0 ? "You haven't saved any lessons yet." : "No matches found with these filters."}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="p-5">Lesson Details</th>
                <th className="p-5">Tone</th>
                <th className="p-5">Saved On</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFavorites.map((fav) => (
                <tr key={fav._id} className="hover:bg-gray-50">
                  <td className="p-5">
                    <p className="font-bold text-[#670D2F] text-sm">{fav.title}</p>
                    <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">{fav.category}</span>
                  </td>
                  <td className="p-5"><span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{fav.emotionalTone || fav.emotionaltone}</span></td>
                  <td className="p-5 text-xs text-gray-500">{new Date(fav.createdAt).toLocaleDateString()}</td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <Link href={`/lesson/${fav._id}`} className="p-2 hover:text-[#670D2F]"><ExternalLink className="w-4 h-4" /></Link>
                    <button 
                      disabled={actionLoading === fav._id}
                      onClick={() => removeFavorite(fav._id)} 
                      className="p-2 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}