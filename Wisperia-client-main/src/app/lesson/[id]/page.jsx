"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, getToken } from "@/lib/auth-client";
import {
  Heart, Bookmark, Flag, User, MessageSquare,
  Lock, Eye, BookOpen, AlertTriangle, Calendar,
  Clock, Globe, Share2, Send, Star, ChevronRight,
  Sparkles, TrendingUp, UserCheck, X
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FacebookShareButton, TwitterShareButton, WhatsappShareButton,
  LinkedinShareButton, FacebookIcon, TwitterIcon, WhatsappIcon, LinkedinIcon
} from "react-share";

/* ─── helpers ─────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const fmtCount = (n) => {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

const readingTime = (text) => {
  if (!text) return 1;
  const wpm = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
};

const TONE_COLORS = {
  Motivational: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Sad: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Realization: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Gratitude: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  default: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

const getToneClass = (tone) => TONE_COLORS[tone] || TONE_COLORS.default;

const REPORT_REASONS = [
  "Inappropriate content",
  "Misinformation",
  "Spam or advertising",
  "Hate speech",
  "Copyright violation",
  "Other",
];

/* ─── sub-components ──────────────────────────────────────── */

function StatBadge({ icon: Icon, label, value, color = "text-theme" }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl card-theme min-w-[90px]">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-lg font-extrabold text-theme">{value}</span>
      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function AuthorCard({ lesson, router }) {
  const [totalLessons, setTotalLessons] = useState(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://wisperia-server.vercel.app";

  useEffect(() => {
    if (!lesson?.userId) return;
    fetch(`${BACKEND_URL}/user/public-lessons/${lesson.userId}`)
      .then(r => r.json())
      .then(data => setTotalLessons(Array.isArray(data) ? data.length : 0))
      .catch(() => { });
  }, [lesson?.userId]);

  const avatar = lesson.creatorImage;
  const initials = (lesson.creatorName || "?").slice(0, 2).toUpperCase();

  return (
    <div className="card-theme rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* avatar */}
      <div className="relative shrink-0">
        {avatar ? (
          <img src={avatar} alt={lesson.creatorName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--primary)]/30" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/15 flex items-center justify-center text-2xl font-extrabold text-[var(--primary)]">
            {initials}
          </div>
        )}
        <span className="absolute -bottom-1.5 -right-1.5 bg-[var(--primary)] text-[var(--background)] text-[9px] font-bold px-1.5 py-0.5 rounded-lg">
          Author
        </span>
      </div>

      {/* info */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-0.5">Written by</p>
        <h3 className="text-xl font-extrabold text-theme">{lesson.creatorName || "Anonymous"}</h3>
        <p className="text-xs text-muted mt-0.5">{lesson.creatorEmail}</p>
        {totalLessons !== null && (
          <p className="text-xs text-muted mt-1">
            <span className="font-bold text-theme">{totalLessons}</span> lessons shared
          </p>
        )}
      </div>

      {/* cta */}
      <button
        onClick={() => router.push(`/public-lessons?userId=${lesson.userId}`)}
        className="shrink-0 flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition cursor-pointer"
      >
        View All <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CommentSection({ lessonId, currentUser, BACKEND_URL, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  const loadComments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        onCountChange?.(data.length);
      }
    } catch { }
    finally { setLoadingComments(false); }
  };

  useEffect(() => { if (lessonId) loadComments(); }, [lessonId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Please sign in to comment"); return; }
    if (!newComment.trim()) { toast.error("Comment cannot be empty"); return; }
    setPosting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (res.ok) {
        toast.success("Comment posted!");
        setNewComment("");
        loadComments();
      } else throw new Error();
    } catch { toast.error("Failed to post comment"); }
    finally { setPosting(false); }
  };

  const fmtRelative = (d) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-extrabold text-theme mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        Comments <span className="text-muted text-base font-semibold">({comments.length})</span>
      </h2>

      {/* post box */}
      {currentUser ? (
        <form onSubmit={handlePost} className="flex gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-[var(--primary)]/15 flex items-center justify-center font-bold text-[var(--primary)] text-sm">
            {currentUser.image
              ? <img src={currentUser.image} alt="" className="w-full h-full object-cover" />
              : (currentUser.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts…"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={posting}
              className="shrink-0 bg-[var(--primary)] text-[var(--background)] w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted mb-6 italic">
          <a href="/signin" className="text-[var(--primary)] font-semibold hover:underline">Sign in</a> to leave a comment.
        </p>
      )}

      {/* list */}
      {loadingComments ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-theme/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-theme/10 rounded w-1/4" />
                <div className="h-3 bg-theme/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const initials2 = (c.userName || "?").slice(0, 1).toUpperCase();
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-[var(--primary)]/15 flex items-center justify-center font-bold text-[var(--primary)] text-sm">
                  {c.userImage
                    ? <img src={c.userImage} alt="" className="w-full h-full object-cover" />
                    : initials2}
                </div>
                <div className="flex-1 card-theme rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-theme">{c.userName || "Anonymous"}</span>
                    <span className="text-[10px] text-muted">{fmtRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-theme/85 leading-relaxed">{c.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShareMenu({ lesson }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = lesson?.title || "Check out this lesson on Wisperia";

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-theme/10 text-theme hover:bg-theme/20 px-5 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            className="absolute bottom-full mb-2 left-0 card-theme rounded-2xl p-3 flex gap-2 shadow-xl z-20 border border-[var(--border)]"
          >
            <FacebookShareButton url={url} quote={title} onClick={() => setOpen(false)}>
              <FacebookIcon size={36} round />
            </FacebookShareButton>
            <TwitterShareButton url={url} title={title} onClick={() => setOpen(false)}>
              <TwitterIcon size={36} round />
            </TwitterShareButton>
            <WhatsappShareButton url={url} title={title} onClick={() => setOpen(false)}>
              <WhatsappIcon size={36} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={url} title={title} onClick={() => setOpen(false)}>
              <LinkedinIcon size={36} round />
            </LinkedinShareButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────── */
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
  const [viewCount] = useState(() => Math.floor(Math.random() * 9500) + 500);
  const [commentCount, setCommentCount] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://wisperia-server.vercel.app";

  /* fetch lesson */
  const fetchData = async () => {
    try {
      const lessonRes = await fetch(`${BACKEND_URL}/lessons/${id}`);
      if (!lessonRes.ok) throw new Error("Failed to load lesson");
      const lessonData = await lessonRes.json();
      setLesson(lessonData);
      if (currentUser && lessonData.likes) {
        setIsLiked(lessonData.likes.includes(currentUser.id));
      }
    } catch {
      toast.error("Failed to load lesson details");
      router.push("/public-lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id, currentUser]);

  /* favorite status */
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!currentUser || !id) return;
      try {
        const token = await getToken();
        const favRes = await fetch(`${BACKEND_URL}/favorites/status?lessonId=${id}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (favRes.ok) { const favData = await favRes.json(); setIsFavorited(favData.saved); }
      } catch { }
    };
    fetchFavoriteStatus();
  }, [currentUser, id]);

  /* handlers */
  const handleUpgrade = async () => {
    if (!currentUser) { toast.error("Please sign in to upgrade"); router.push("/signin"); return; }
    const toastId = toast.loading("Preparing checkout...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: currentUser.id, userEmail: currentUser.email }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      toast.dismiss(toastId);
      window.location.href = url;
    } catch { toast.error("Failed to initiate payment", { id: toastId }); }
  };

  const handleLike = async () => {
    if (!currentUser) { toast.error("Please sign in to like this lesson"); router.push("/signin"); return; }
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${id}/like`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
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
        toast.success(data.hasLiked ? "❤️ Added to your likes!" : "Removed from likes");
      } else throw new Error();
    } catch { toast.error("Failed to update like status"); }
  };

  const handleFavorite = async () => {
    if (!currentUser) { toast.error("Please sign in to save this lesson"); router.push("/signin"); return; }
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.saved);
        toast.success(data.saved ? "🔖 Saved to favorites!" : "Removed from favorites");
      } else throw new Error();
    } catch { toast.error("Failed to toggle favorite"); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Please sign in to report content"); router.push("/signin"); return; }
    if (!reason.trim()) { toast.error("Please select or specify a reason"); return; }
    setReporting(true);
    const toastId = toast.loading("Submitting report...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lessons/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("Report submitted. Thank you for keeping Wisperia safe.", { id: toastId });
        setShowReportModal(false);
        setReason("");
      } else throw new Error();
    } catch { toast.error("Failed to submit report", { id: toastId }); }
    finally { setReporting(false); }
  };

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <main className="min-h-screen py-16 px-4 bg-theme text-theme">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 bg-theme/10 rounded-2xl w-3/4" />
          <div className="h-4 bg-theme/10 rounded-xl w-1/2" />
          <div className="h-64 bg-theme/10 rounded-3xl" />
          <div className="h-32 bg-theme/10 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!lesson) return null;

  const isLocked =
    (lesson.accesslevel === "premium" || lesson.accessLevel === "premium") &&
    !isPremiumUser &&
    currentUser?.role !== "admin";

  const tone = lesson.emotionalTone || lesson.emotionaltone;
  const heroImage = lesson.image?.display_url || lesson.image?.url || (typeof lesson.image === "string" ? lesson.image : null);
  const estRead = readingTime(lesson.description);

  /* ── premium locked view ── */
  if (isLocked) {
    return (
      <main className="min-h-screen py-16 px-4 bg-theme text-theme">
        <div className="max-w-4xl mx-auto">
          {/* blurred preview */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="blur-sm pointer-events-none select-none card-theme p-10 space-y-4 opacity-50">
              <div className="h-8 bg-theme/20 rounded-xl w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-theme/20 rounded w-full" />
                <div className="h-3 bg-theme/20 rounded w-5/6" />
                <div className="h-3 bg-theme/20 rounded w-4/6" />
              </div>
            </div>

            {/* overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-md p-8 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                <div className="w-20 h-20 rounded-3xl bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-4 border border-[var(--primary)]/30">
                  <Lock className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Premium Content</h2>
                <p className="text-white/70 text-sm max-w-sm mx-auto">
                  This lesson is exclusive to Premium members. Unlock unlimited access to all premium lessons.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                  <button
                    onClick={handleUpgrade}
                    className="bg-[var(--primary)] text-[var(--background)] px-8 py-3.5 rounded-2xl font-extrabold hover:opacity-90 transition cursor-pointer flex items-center gap-2 justify-center"
                  >
                    <Sparkles className="w-4 h-4" /> Upgrade to Premium
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="glass-button px-8 py-3.5 rounded-2xl font-bold cursor-pointer"
                  >
                    Go Back
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── full lesson view ── */
  return (
    <main className="min-h-screen py-12 px-4 bg-theme text-theme transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Hero Image ── */}
        {heroImage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden shadow-2xl aspect-[16/6] relative"
          >
            <img src={heroImage} alt={lesson.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        )}

        {/* ── Main Article ── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-theme p-8 sm:p-10 rounded-[2.5rem] shadow-xl"
        >
          {/* badges row */}
          <div className="flex flex-wrap gap-2 mb-5">
            {lesson.category && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                {lesson.category}
              </span>
            )}
            {tone && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getToneClass(tone)}`}>
                {tone}
              </span>
            )}
            {lesson.isFeatured && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${lesson.accesslevel === "premium" || lesson.accessLevel === "premium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
              }`}>
              {lesson.accesslevel === "premium" || lesson.accessLevel === "premium" ? "⭐ Premium" : "✅ Free"}
            </span>
          </div>

          {/* title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-theme mb-6 leading-tight">
            {lesson.title}
          </h1>

          {/* description / story */}
          <div className="prose max-w-none text-theme/85 whitespace-pre-line leading-relaxed text-base mb-8">
            {lesson.description}
          </div>

          {/* ── Metadata block ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-theme/5 border border-[var(--border)] mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Created</span>
              <span className="text-xs font-semibold text-theme flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                {fmtDate(lesson.createdAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Updated</span>
              <span className="text-xs font-semibold text-theme flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                {fmtDate(lesson.updatedAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Visibility</span>
              <span className="text-xs font-semibold text-theme flex items-center gap-1 capitalize">
                <Globe className="w-3.5 h-3.5 text-muted" />
                {lesson.visibility || "public"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Read Time</span>
              <span className="text-xs font-semibold text-theme flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted" />
                {estRead} min read
              </span>
            </div>
          </div>

          {/* ── Stats section ── */}
          <div className="flex flex-wrap gap-3 mb-8">
            <StatBadge icon={Heart} label="Likes" value={fmtCount(lesson.likesCount)} color="text-red-500" />
            <StatBadge icon={Bookmark} label="Saves" value={fmtCount(lesson.favoritesCount || 0)} color="text-yellow-500" />
            <StatBadge icon={Eye} label="Views" value={fmtCount(viewCount)} color="text-blue-500" />
            <StatBadge icon={MessageSquare} label="Comments" value={commentCount === null ? "…" : fmtCount(commentCount)} color="text-green-500" />
          </div>

          {/* ── Interaction Buttons ── */}
          <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-7">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleLike}
              id="like-btn"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm ${isLiked
                ? "bg-[var(--primary)] text-[var(--background)] shadow-md"
                : "bg-theme/10 text-theme hover:bg-theme/20"
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"} ({fmtCount(lesson.likesCount || 0)})
            </motion.button>

            {/* Favorite */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleFavorite}
              id="favorite-btn"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm ${isFavorited
                ? "bg-yellow-500 text-black shadow-md"
                : "bg-theme/10 text-theme hover:bg-theme/20"
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </motion.button>

            {/* Share */}
            <ShareMenu lesson={lesson} />

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              id="report-btn"
              className="flex items-center gap-2 bg-red-500/10 px-6 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-500/20 transition cursor-pointer text-sm ml-auto"
            >
              <Flag className="w-4 h-4" /> Report
            </button>
          </div>
        </motion.article>

        {/* ── Author Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AuthorCard lesson={lesson} router={router} />
        </motion.div>

        {/* ── Comment Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-theme p-8 rounded-[2.5rem] shadow-xl"
        >
          <CommentSection
            lessonId={id}
            currentUser={currentUser}
            BACKEND_URL={BACKEND_URL}
            onCountChange={setCommentCount}
          />
        </motion.div>

      </div>

      {/* ── Report Modal ── */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-theme p-8 rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-extrabold text-theme flex items-center gap-2">
                  <AlertTriangle className="text-red-500 w-5 h-5" /> Report Content
                </h3>
                <button
                  onClick={() => { setShowReportModal(false); setReason(""); }}
                  className="w-8 h-8 rounded-xl bg-theme/10 flex items-center justify-center hover:bg-theme/20 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-theme" />
                </button>
              </div>
              <p className="text-xs text-muted mb-6">
                Help us keep Wisperia a safe space. Select a reason for flagging this lesson.
              </p>

              <form onSubmit={handleReport} className="space-y-4">
                {/* reason dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase mb-2">Reason</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    <option value="">— Select a reason —</option>
                    {REPORT_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={reporting}
                    id="submit-report-btn"
                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? "Submitting…" : "Submit Report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowReportModal(false); setReason(""); }}
                    className="flex-1 bg-theme/10 text-theme font-bold py-3 rounded-xl hover:bg-theme/20 transition text-sm cursor-pointer"
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