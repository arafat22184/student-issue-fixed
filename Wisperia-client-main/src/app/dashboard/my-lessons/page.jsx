"use client";

import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import {
  Eye, EyeOff, Edit, Trash2, Calendar, Heart,
  ExternalLink, Loader2, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { confirmToast } from "@/lib/confirmToast";

export default function MyLessonsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPremiumUser = user?.plan === "premium" || user?.isPremium;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchLessons = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/user/my-lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLessons(data || []);
    } catch (err) {
      toast.error("Failed to load your lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLessons();
  }, [user]);

  const updateLesson = async (lessonId, updates, label) => {
    setActionLoading(lessonId);
    const toastId = toast.loading(`Updating ${label}...`);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        toast.success(`Lesson updated!`, { id: toastId });
        setLessons(prev => prev.map(l => l._id === lessonId ? { ...l, ...updates } : l));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error(`Failed to update ${label}`, { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (lessonId, lessonTitle) => {
    const confirmed = await confirmToast({
      title: "Delete this lesson?",
      description: `"${lessonTitle}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      confirmStyle: "bg-red-600",
      icon: <AlertTriangle size={18} className="text-red-500" />,
    });
    if (!confirmed) return;

    const toastId = toast.loading("Deleting...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Lesson deleted successfully", { id: toastId });
        setLessons(prev => prev.filter(l => l._id !== lessonId));
      }
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#670D2F] dark:text-white" /></div>
  );

  return (
    <div className="space-y-8 p-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white">My Lessons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your insights and published lessons.</p>
        </div>
        <Link 
          href="/dashboard/add-lesson" 
          className="bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition shadow-md"
        >
          Add New Lesson
        </Link>
      </header>

      {lessons.length === 0 ? (
        <div className="card-theme rounded-3xl p-12 text-center shadow-sm">
          <p className="text-gray-400 dark:text-gray-500 mb-6 font-medium">No lessons found. Start your journey today!</p>
          <Link 
            href="/dashboard/add-lesson" 
            className="bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] px-6 py-2.5 rounded-xl font-bold hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition shadow-md inline-block"
          >
            Create Lesson
          </Link>
        </div>
      ) : (
        <div className="card-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="p-5">Title</th>
                  <th className="p-5">Date</th>
                  <th className="p-5 text-center">Visibility</th>
                  <th className="p-5 text-center">Access</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {lessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-5 font-bold text-[#670D2F] dark:text-white max-w-xs truncate">{lesson.title}</td>
                    <td className="p-5 text-xs text-gray-500 dark:text-gray-400">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                    <td className="p-5 text-center">
                      <button
                        disabled={actionLoading === lesson._id}
                        onClick={() => updateLesson(lesson._id, { visibility: lesson.visibility === 'public' ? 'private' : 'public' }, 'visibility')}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition cursor-pointer border border-transparent"
                      >
                        {lesson.visibility}
                      </button>
                    </td>
                    <td className="p-5 text-center">
                      <button
                        disabled={!isPremiumUser || actionLoading === lesson._id}
                        onClick={() => updateLesson(lesson._id, { accesslevel: lesson.accesslevel === 'premium' ? 'free' : 'premium' }, 'access')}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition ${
                          lesson.accesslevel === 'premium' 
                            ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/20 hover:bg-yellow-200/50 dark:hover:bg-yellow-500/20' 
                            : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20 hover:bg-blue-200/50 dark:hover:bg-blue-500/20'
                        } ${!isPremiumUser ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        {lesson.accesslevel || 'free'}
                      </button>
                    </td>
                    <td className="p-5 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        <Link 
                          href={`/dashboard/update-lesson/${lesson._id}`} 
                          className="p-2 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Edit Lesson"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(lesson._id, lesson.title)} 
                          className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
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
    </div>
  );
}