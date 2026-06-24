"use client";

import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { 
  Eye, EyeOff, Edit, Trash2, Calendar, Heart, 
  ExternalLink, Loader2 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

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

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    const toastId = toast.loading("Deleting...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Deleted successfully", { id: toastId });
        setLessons(prev => prev.filter(l => l._id !== lessonId));
      }
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#670D2F]" /></div>
  );

  return (
    <div className="space-y-8 p-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#670D2F]">My Lessons</h1>
          <p className="text-gray-500 text-sm">Manage your insights and published lessons.</p>
        </div>
        <Link href="/dashboard/add-lesson" className="bg-[#670D2F] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#5a0b27]">
          Add New Lesson
        </Link>
      </header>

      {lessons.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center">
          <p className="text-gray-400 mb-6">No lessons found. Start your journey today!</p>
          <Link href="/dashboard/add-lesson" className="bg-[#670D2F] text-white px-6 py-2.5 rounded-xl font-bold">Create Lesson</Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="p-5">Title</th>
                <th className="p-5">Date</th>
                <th className="p-5 text-center">Visibility</th>
                <th className="p-5 text-center">Access</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#670D2F]">{lesson.title}</td>
                  <td className="p-5 text-xs text-gray-500">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                  <td className="p-5 text-center">
                    <button 
                      disabled={actionLoading === lesson._id}
                      onClick={() => updateLesson(lesson._id, { visibility: lesson.visibility === 'public' ? 'private' : 'public' }, 'visibility')}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100"
                    >
                      {lesson.visibility}
                    </button>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      disabled={!isPremiumUser || actionLoading === lesson._id}
                      onClick={() => updateLesson(lesson._id, { accesslevel: lesson.accesslevel === 'premium' ? 'free' : 'premium' }, 'access')}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${lesson.accesslevel === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {lesson.accesslevel || 'free'}
                    </button>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <Link href={`/dashboard/update-lesson/${lesson._id}`} className="p-2 hover:text-blue-600"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(lesson._id)} className="p-2 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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