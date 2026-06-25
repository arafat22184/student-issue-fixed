"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, getToken } from "@/lib/auth-client";
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
  const [reason, setReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const lessonRes = await fetch(`${BACKEND_URL}/lessons/${id}`);
      if (!lessonRes.ok) throw new Error("Failed to load lesson");
      const lessonData = await lessonRes.json();
      setLesson(lessonData);

      // Check like status
      if (currentUser && lessonData.likes) {
        setIsLiked(lessonData.likes.includes(currentUser.id));
      }
    } catch (err) {
      toast.error("Failed to load lesson details");
      router.push("/public-lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, currentUser]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!currentUser || !id) return;
      try {
        const token = await getToken();
        const favRes = await fetch(`${BACKEND_URL}/favorites/status?lessonId=${id}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (favRes.ok) {
          const favData = await favRes.json();
          setIsFavorited(favData.saved);
        }
      } catch (err) {
        console.error("Favorite status error:", err);
      }
    };
    fetchFavoriteStatus();
  }, [currentUser, id]);

  const handleUpgrade = async () => {
    if (!currentUser) {
      toast.error("Please sign in to upgrade your account");
      router.push("/signin");
      return;
    }
    const toastId = toast.loading("Preparing checkout...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email
        })
      });
      if (!res.ok) throw new Error("Failed to start stripe session");
      const { url } = await res.json();
      toast.dismiss(toastId);
      window.location.href = url;
    } catch (err) {
      toast.error("Failed to initiate payment", { id: toastId });
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please sign in to like this lesson");
      router.push("/signin");
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${id}/like`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.hasLiked);
        setLesson(prev => ({
          ...prev,
          likesCount: data.likesCount,
          likes: data.hasLiked
            ? [...(prev.likes || []), currentUser.id]
            : (prev.likes || []).filter(uid => uid !== currentUser.id)
        }));
        toast.success(data.hasLiked ? "Added to your likes!" : "Removed from your likes");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to update like status");
    }
  };
  const handleFavorite = async () => {
    if (!currentUser) {
      toast.error("Please sign in to save this lesson");
      router.push("/signin");
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId: id })
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.saved);
        toast.success(data.saved ? "Saved to favorites!" : "Removed from favorites");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to toggle favorite status");
    }
  };
  const handleReport = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to report content");
      router.push("/signin");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please specify a reason");
      return;
    }
    setReporting(true);
    const toastId = toast.loading("Submitting report...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        toast.success("Thank you. The report has been filed and sent to moderation.", { id: toastId });
        setShowReportModal(false);
        setReason("");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to submit report", { id: toastId });
    } finally {
      setReporting(false);
    }
  };
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!lesson) return null;

  const isLocked = (lesson.accesslevel === "premium" || lesson.accessLevel === "premium") && !isPremiumUser && currentUser?.role !== "admin";

  console.log(lesson, "From details lesson page")
  return (
    <main className="min-h-screen py-16 px-4 bg-theme text-theme transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        {isLocked ? (
          <motion.section className="card-theme p-12 rounded-[2.5rem] shadow-2xl text-center">
            <Lock className="w-16 h-16 text-theme mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-theme mb-4">Premium Content</h2>
            <button onClick={handleUpgrade} className="bg-primary text-[var(--background)] px-8 py-4 rounded-xl font-bold hover:opacity-90 transition cursor-pointer">
              Upgrade to Premium
            </button>
          </motion.section>
        ) : (
          <article className="card-theme p-8 rounded-[2.5rem] shadow-xl">
            <h1 className="text-4xl font-extrabold text-theme mb-6">{lesson.title}</h1>
            <div className="prose text-theme/90 whitespace-pre-line leading-relaxed mb-10">{lesson.description}</div>

            <div className="mt-10 flex flex-wrap gap-4 border-t border-theme/15 pt-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm ${isLiked
                  ? "bg-primary text-[var(--background)] shadow-md"
                  : "bg-theme/10 text-theme hover:bg-theme/20"
                  }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"} ({lesson.likesCount || 0})
              </button>

              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm ${isFavorited
                  ? "bg-yellow-500 text-black shadow-md"
                  : "bg-theme/10 text-theme hover:bg-theme/20"
                  }`}
              >
                <Bookmark className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 bg-red-500/10 px-6 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-500/20 transition cursor-pointer text-sm"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
          </article>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-theme p-8 rounded-3xl w-full max-w-md shadow-2xl border border-theme/20"
            >
              <h3 className="text-xl font-extrabold text-theme mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Report Content
              </h3>
              <p className="text-xs text-muted mb-6">
                Help us keep Wisperia a safe space. Please describe why you are flagging this lesson.
              </p>

              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase mb-2">Reason for report</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={4}
                    placeholder="Provide details about the issue..."
                    className="w-full p-3 rounded-xl outline-none focus:border-red-500 transition text-sm text-theme"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={reporting}
                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? "Submitting..." : "Submit Report"}
                  </button>
                  nn  <button
                    type="button"
                    onClick={() => { setShowReportModal(false); setReason(""); }}
                    className="flex-1 glass-button font-bold py-3 rounded-xl transition text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}