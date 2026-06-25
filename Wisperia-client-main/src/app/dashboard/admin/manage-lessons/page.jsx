"use client";
import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Trash2, Star, CheckCircle, ExternalLink, Calendar,
  Filter, User, ShieldAlert, AlertTriangle, HelpCircle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];

export default function ManageLessonsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState("All");
  const [visibility, setVisibility] = useState("All");
  const [reviewStatus, setReviewStatus] = useState("All");

  // Deletion Modal State
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/lessons`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLessons(data || []);
        setFilteredLessons(data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lessons database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session || session.user.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchLessons();
      }
    }
  }, [session, isPending]);

  // Apply filters locally
  useEffect(() => {
    let result = [...lessons];

    // Filter by Category
    if (category !== "All") {
      result = result.filter(l => l.category === category);
    }

    // Filter by Visibility
    if (visibility !== "All") {
      result = result.filter(l => l.visibility === visibility);
    }

    // Filter by Review Status
    if (reviewStatus !== "All") {
      const wantReviewed = reviewStatus === "reviewed";
      result = result.filter(l => (l.isReviewed || false) === wantReviewed);
    }

    setFilteredLessons(result);
  }, [category, visibility, reviewStatus, lessons]);

  // Toggle Featured
  const toggleFeatured = async (lessonId, currentVal) => {
    const newVal = !currentVal;
    const toastId = toast.loading("Updating featured status...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/lessons/${lessonId}/featured`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: newVal })
      });
      if (res.ok) {
        toast.success(newVal ? "Lesson added to Featured section!" : "Removed from Featured", { id: toastId });
        setLessons(prev => prev.map(l => l._id === lessonId ? { ...l, isFeatured: newVal } : l));
      } else {
        toast.error("Failed to update featured status", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  // Mark Reviewed
  const markReviewed = async (lessonId) => {
    const toastId = toast.loading("Marking as reviewed...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/lessons/${lessonId}/reviewed`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Content marked as reviewed!", { id: toastId });
        setLessons(prev => prev.map(l => l._id === lessonId ? { ...l, isReviewed: true } : l));
      } else {
        toast.error("Failed to mark as reviewed", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  // Delete Lesson Handler (Triggered from Custom Modal)
  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    const lessonId = lessonToDelete;
    setLessonToDelete(null);

    const toastId = toast.loading("Deleting lesson...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Lesson permanently deleted from platform", { id: toastId });
        setLessons(prev => prev.filter(l => l._id !== lessonId));
      } else {
        toast.error("Failed to delete lesson", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[#670D2F] dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading lessons database...</p>
      </div>
    );
  }

  // Stats Counters
  const publicCount = lessons.filter(l => l.visibility === "public").length;
  const privateCount = lessons.filter(l => l.visibility === "private").length;
  const reviewedCount = lessons.filter(l => l.isReviewed).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white tracking-tight">Manage Lessons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review, feature, or remove life lessons across the application.</p>
        </div>
        <div className="bg-[#670D2F]/5 dark:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-[#670D2F] dark:text-white border border-[#670D2F]/10 dark:border-white/10">
          Admin Database Access
        </div>
      </header>

      {/* Stats Board */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-theme p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Public Lessons</span>
          <h3 className="text-3xl font-black text-[#670D2F] dark:text-white mt-2">{publicCount}</h3>
        </div>
        <div className="card-theme p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Private Lessons</span>
          <h3 className="text-3xl font-black text-[#670D2F] dark:text-white mt-2">{privateCount}</h3>
        </div>
        <div className="card-theme p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Reviewed Insights</span>
          <h3 className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">{reviewedCount}</h3>
        </div>
      </section>

      {/* Filters Form */}
      <section className="card-theme rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-sm outline-none text-gray-700 dark:text-gray-200 font-bold focus:border-[#670D2F] dark:focus:border-white transition-all cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-sm outline-none text-gray-700 dark:text-gray-200 font-bold focus:border-[#670D2F] dark:focus:border-white transition-all cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">All Visibility</option>
            <option value="public" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Public</option>
            <option value="private" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Private</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Review Status</label>
          <select
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-sm outline-none text-gray-700 dark:text-gray-200 font-bold focus:border-[#670D2F] dark:focus:border-white transition-all cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">All Statuses</option>
            <option value="reviewed" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Reviewed Only</option>
            <option value="pending" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Pending Review</option>
          </select>
        </div>
      </section>

      {/* Table view */}
      {filteredLessons.length === 0 ? (
        <div className="card-theme rounded-[2rem] p-16 text-center text-gray-400 dark:text-gray-500 text-sm border-dashed">
          No lessons found matching the filters.
        </div>
      ) : (
        <div className="card-theme rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5">Title</th>
                  <th className="p-5">Creator Email</th>
                  <th className="p-5 text-center">Visibility</th>
                  <th className="p-5 text-center">Access Level</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/10">
                {filteredLessons.map((l, index) => (
                  <tr key={l._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-150">

                    {/* Title & Category */}
                    <td className="p-5">
                      <div className="max-w-xs md:max-w-md">
                        <h4 className="font-extrabold text-[#670D2F] dark:text-white text-sm truncate">{l.title}</h4>
                        <span className="inline-block text-[9px] font-bold text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/30 border border-pink-100/50 dark:border-pink-500/20 px-2 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                          {l.category}
                        </span>
                      </div>
                    </td>

                    {/* Creator Email */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{l.creatorName || "Anonymous"}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{l.creatorEmail}</span>
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        l.visibility === "public"
                          ? "bg-green-50 dark:bg-green-500/10 border-green-200/50 dark:border-green-500/20 text-green-700 dark:text-green-400"
                          : "bg-gray-50 dark:bg-white/10 border-gray-200/50 dark:border-white/20 text-gray-500 dark:text-gray-400"
                      }`}>
                        {l.visibility}
                      </span>
                    </td>

                    {/* Access Level */}
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        l.accesslevel === "premium" || l.accessLevel === "premium"
                          ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                          : "bg-blue-50 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}>
                        {l.accesslevel || l.accessLevel || "free"}
                      </span>
                    </td>

                    {/* Actions Group */}
                    <td className="p-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3.5">

                        {/* Toggle Featured */}
                        <button
                          onClick={() => toggleFeatured(l._id, l.isFeatured || false)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer ${
                            l.isFeatured
                              ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 shadow-sm"
                              : "text-gray-400 dark:text-gray-300 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:text-yellow-600 hover:bg-yellow-50/30 hover:border-yellow-200"
                          }`}
                          title={l.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                        >
                          <Star className={`w-4 h-4 ${l.isFeatured ? "fill-yellow-500" : ""}`} />
                        </button>

                        {/* Mark Reviewed */}
                        {l.isReviewed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-3 py-1.5 rounded-xl shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Reviewed
                          </span>
                        ) : (
                          <button
                            onClick={() => markReviewed(l._id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-100/50 dark:hover:bg-blue-500/20 transition cursor-pointer"
                          >
                            Mark Reviewed
                          </button>
                        )}

                        {/* External details link */}
                        <Link
                          href={`/lesson/${l._id}`}
                          className="p-2 text-gray-400 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:text-[#670D2F] dark:hover:text-white hover:bg-[#670D2F]/5 dark:hover:bg-white/5 hover:border-[#670D2F]/20 dark:hover:border-white/20 transition-all rounded-xl"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Delete Lesson Button */}
                        <button
                          onClick={() => setLessonToDelete(l._id)}
                          className="p-2 text-gray-400 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-500/30 transition-all cursor-pointer rounded-xl"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal */}
      <AnimatePresence>
        {lessonToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="card-theme bg-white dark:bg-[#450117] rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative"
            >
              <h3 className="text-2xl font-extrabold text-[#670D2F] dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" /> Permanent Deletion
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                Are you sure you want to permanently delete this lesson? This action is irreversible and will also clean up all comments, favorites, and flag records.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteLesson}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition cursor-pointer text-sm shadow-md shadow-red-600/10"
                >
                  Delete Permanently
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLessonToDelete(null)}
                  className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer text-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
