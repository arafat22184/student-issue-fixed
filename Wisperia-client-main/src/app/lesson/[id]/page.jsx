"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  Heart, Bookmark, Flag, User, MessageSquare, 
  Lock, Eye, BookOpen, AlertTriangle 
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isPremiumUser = currentUser?.plan === "premium" || currentUser?.isPremium;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const lessonRes = await fetch(`${BACKEND_URL}/lessons/${id}`);
      const lessonData = await lessonRes.json();
      setLesson(lessonData);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load");
      router.push("/public-lessons");
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const handleUpgrade = async () => {
    const { data } = await authClient.token();
    const token = data?.token;
    const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` }
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!lesson) return null;

  const isLocked = (lesson.accesslevel === "premium" || lesson.accessLevel === "premium") && !isPremiumUser && currentUser?.role !== "admin";

  return (
    <main className="min-h-screen py-16 px-4 bg-[#fcf8f9]">
      <div className="max-w-4xl mx-auto">
        {isLocked ? (
          <motion.section className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-pink-100">
         
            <Lock className="w-16 h-16 text-[#670D2F] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#670D2F] mb-4">Premium Content</h2>
            <button onClick={handleUpgrade} className="bg-[#670D2F] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5a0b27]">
              Upgrade to Premium
            </button>
          </motion.section>
        ) : (
          <article className="bg-white p-8 rounded-[2.5rem] shadow-xl">
            <h1 className="text-4xl font-black text-[#670D2F] mb-6">{lesson.title}</h1>
            <div className="prose text-gray-700">{lesson.description}</div>
            
            <div className="mt-10 flex gap-4">
              <button className="flex items-center gap-2 bg-pink-50 px-6 py-2 rounded-xl font-bold text-pink-600">
                <Heart className="w-5 h-5" /> Like
              </button>
              <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 bg-red-50 px-6 py-2 rounded-xl font-bold text-red-600">
                <Flag className="w-5 h-5" /> Report
              </button>
            </div>
          </article>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <motion.div className="bg-white p-8 rounded-2xl w-96">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" /> Report Lesson
              </h3>
              <button onClick={() => setShowReportModal(false)} className="w-full bg-gray-100 py-2 rounded-lg">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}