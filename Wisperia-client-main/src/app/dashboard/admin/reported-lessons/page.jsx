"use client";
import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, CheckCircle, Info, Calendar, User, ShieldAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportedLessonsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [flaggedGroups, setFlaggedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Group for Modal
  const [selectedGroup, setSelectedGroup] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://wisperia-server.vercel.app";

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/reported-lessons`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedGroups(data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reported lessons archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session || session.user.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchReports();
      }
    }
  }, [session, isPending]);

  // Permanently Delete Lesson from Platform
  const handleDeleteLesson = async (lessonId) => {
    const toastId = toast.loading("Permanently deleting lesson...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Lesson and all associated reports permanently deleted", { id: toastId });
        setFlaggedGroups(prev => prev.filter(g => g._id !== lessonId));
        setSelectedGroup(null);
      } else {
        toast.error("Failed to delete lesson", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  // Clear Flags / Ignore Reports
  const handleIgnoreReports = async (lessonId) => {
    const toastId = toast.loading("Clearing lesson reports...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/reported-lessons/${lessonId}/ignore`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("All reports ignored and cleared. Lesson remains live.", { id: toastId });
        setFlaggedGroups(prev => prev.filter(g => g._id !== lessonId));
        setSelectedGroup(null);
      } else {
        toast.error("Failed to ignore reports", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[#670D2F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading flagged content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#670D2F] tracking-tight">Reported Lessons</h1>
          <p className="text-gray-500 text-sm mt-1">Review, audit, and moderate flagged platform entries.</p>
        </div>
        <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold text-red-700">
          Flagged Reports Console
        </div>
      </header>

      {flaggedGroups.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center text-gray-400 text-sm border-dashed">
          🎉 No pending reports. The platform is completely clean!
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Lesson Title</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Report Count</th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flaggedGroups.map((group) => (
                  <tr key={group._id} className="hover:bg-red-50/5 transition-all">
                    {/* Lesson Title */}
                    <td className="p-5">
                      <div className="max-w-md">
                        <h4 className="font-extrabold text-[#670D2F] text-sm truncate">{group.lessonTitle || "Untitled Lesson"}</h4>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider block mt-1">ID: {group._id}</span>
                      </div>
                    </td>

                    {/* Report count */}
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-red-700 bg-red-50 border border-red-100/50 px-3 py-1 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {group.count} Reports
                      </span>
                    </td>

                    {/* Actions Button */}
                    <td className="p-5 text-right">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="inline-flex items-center gap-1.5 bg-[#670D2F] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#5a0b27] transition shadow-sm cursor-pointer"
                      >
                        <Info className="w-4 h-4" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Moderation Details Modal */}
      <AnimatePresence>
        {selectedGroup && (
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
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 border border-gray-100 shadow-2xl relative max-h-[85vh] flex flex-col justify-between"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedGroup(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto pr-2">
                <header className="border-b border-gray-100 pb-5 mb-5 pr-8">
                  <span className="inline-block text-red-700 font-extrabold text-[10px] uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-lg mb-3">
                    Moderation Audit Log
                  </span>
                  <h3 className="text-xl font-extrabold text-[#670D2F] tracking-tight leading-snug">
                    {selectedGroup.lessonTitle || "Untitled Lesson"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Lesson ID: {selectedGroup._id}</p>
                </header>

                <div className="space-y-4 divide-y divide-gray-50">
                  {selectedGroup.reports.map((r, i) => (
                    <div key={i} className="pt-4 first:pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-2 mb-2">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          Reporter: {r.reporterUserId || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-red-50/30 border border-red-100/50 rounded-xl p-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-red-700 block mb-1">Reason Selected:</span>
                        <p className="text-sm font-bold text-[#670D2F]">{r.reason || "Inappropriate Content"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIgnoreReports(selectedGroup._id)}
                  className="flex-1 bg-green-50 text-green-700 border border-green-200 font-bold py-3.5 rounded-xl hover:bg-green-100/30 transition text-sm cursor-pointer shadow-sm"
                >
                  Ignore Reports
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteLesson(selectedGroup._id)}
                  className="flex-1 bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition text-sm cursor-pointer shadow-lg shadow-red-600/10 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Lesson
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
