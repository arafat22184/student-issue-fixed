"use client";
import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, CheckCircle, Info, Calendar, User, ShieldAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { confirmToast } from "@/lib/confirmToast";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportedLessonsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [flaggedGroups, setFlaggedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Group for Modal
  const [selectedGroup, setSelectedGroup] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

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
    const lessonTitle = selectedGroup?.lessonTitle || "this lesson";
    const confirmed = await confirmToast({
      title: "Permanently Delete Lesson?",
      description: `"${lessonTitle}" and all its reports will be deleted permanently. This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      confirmStyle: "bg-red-600",
      icon: <AlertTriangle size={18} className="text-red-500" />,
    });
    if (!confirmed) return;

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
    const lessonTitle = selectedGroup?.lessonTitle || "this lesson";
    const confirmed = await confirmToast({
      title: "Ignore Reports?",
      description: `Clear all reports for "${lessonTitle}". It will remain live on the platform.`,
      confirmLabel: "Yes, Ignore",
      confirmStyle: "bg-green-600",
      icon: <CheckCircle size={18} className="text-green-500" />,
    });
    if (!confirmed) return;

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
        <div className="w-10 h-10 border-4 border-[#670D2F] dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading flagged content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white tracking-tight">Reported Lessons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review, audit, and moderate flagged platform entries.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100/50 dark:border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold text-red-700 dark:text-red-400">
          Flagged Reports Console
        </div>
      </header>

      {flaggedGroups.length === 0 ? (
        <div className="card-theme rounded-[2rem] p-16 text-center text-gray-400 dark:text-gray-500 text-sm border-dashed">
          🎉 No pending reports. The platform is completely clean!
        </div>
      ) : (
        <div className="card-theme rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5">Lesson Title</th>
                  <th className="p-5 text-center">Report Count</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/10">
                {flaggedGroups.map((group) => (
                  <tr key={group._id} className="hover:bg-red-50/5 dark:hover:bg-white/5 transition-all">
                    {/* Lesson Title */}
                    <td className="p-5">
                      <div className="max-w-md">
                        <h4 className="font-extrabold text-[#670D2F] dark:text-white text-sm truncate">{group.lessonTitle || "Untitled Lesson"}</h4>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block mt-1">ID: {group._id}</span>
                      </div>
                    </td>

                    {/* Report count */}
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100/50 dark:border-red-500/20 px-3 py-1 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {group.count} Reports
                      </span>
                    </td>

                    {/* Actions Button */}
                    <td className="p-5 text-right">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="inline-flex items-center gap-1.5 bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition shadow-sm cursor-pointer"
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
              className="card-theme bg-white dark:bg-[#450117] rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative max-h-[85vh] flex flex-col justify-between"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedGroup(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto pr-2">
                <header className="border-b border-gray-100 dark:border-white/10 pb-5 mb-5 pr-8">
                  <span className="inline-block text-red-700 dark:text-red-400 font-extrabold text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-500/10 border border-red-100/50 dark:border-red-500/20 px-3 py-1.5 rounded-lg mb-3">
                    Moderation Audit Log
                  </span>
                  <h3 className="text-xl font-extrabold text-[#670D2F] dark:text-white tracking-tight leading-snug">
                    {selectedGroup.lessonTitle || "Untitled Lesson"}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Lesson ID: {selectedGroup._id}</p>
                </header>

                <div className="space-y-4 divide-y divide-gray-50 dark:divide-white/10">
                  {selectedGroup.reports.map((r, i) => (
                    <div key={i} className="pt-4 first:pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 dark:text-gray-500 gap-2 mb-2">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600 dark:text-gray-300">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          Reporter: {r.reporterUserId || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-red-50/30 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/20 rounded-xl p-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-red-700 dark:text-red-400 block mb-1">Reason Selected:</span>
                        <p className="text-sm font-bold text-[#670D2F] dark:text-white">{r.reason || "Inappropriate Content"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="mt-8 border-t border-gray-100 dark:border-white/10 pt-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIgnoreReports(selectedGroup._id)}
                  className="flex-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-bold py-3.5 rounded-xl hover:bg-green-100/30 dark:hover:bg-green-500/20 transition text-sm cursor-pointer shadow-sm"
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
