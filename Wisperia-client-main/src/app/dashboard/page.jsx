"use client";
import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, PlusCircle, User, ArrowRight, Activity, Calendar } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function UserDashboardHome() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchStats = async () => {
    try {
      const tokenRes = await fetch("/api/auth/token", { credentials: "include" });
      const tokenData = await tokenRes.json();
      const token = tokenData?.token;
      if (!token) {
        toast.error("Auth token missing");
        return;
      }
      const res = await fetch(`${BACKEND_URL}/user/dashboard-stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/signin");
      } else {
        fetchStats();
      }
    }
  }, [session, isPending]);

  if (isPending || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#670D2F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading stats...</p>
      </div>
    );
  }

  const user = session?.user;
  const categoriesList = stats?.categoryStats || [];
  const maxCount = Math.max(...categoriesList.map(c => c.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Welcome banner */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#670D2F] to-[#5a0b27] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-pink-900/5 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <span className="inline-block text-pink-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full">
            User Workspace
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-2 tracking-tight">
            Welcome back, {user?.name || "Seeker"}!
          </h1>
          <p className="text-pink-100/90 text-sm md:text-base max-w-lg leading-relaxed">
            Preserve your milestones, reflect on daily realizations, and guide the community with your wisdom.
          </p>
        </div>
      </motion.header>

      {/* Analytics overview */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300"
        >
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lessons Created</span>
            <h3 className="text-3xl font-black text-[#670D2F] mt-2">{stats?.totalCreated || 0}</h3>
          </div>
          <div className="bg-[#670D2F]/5 p-4 rounded-2xl text-[#670D2F]">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300"
        >
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Saved Favorites</span>
            <h3 className="text-3xl font-black text-[#670D2F] mt-2">{stats?.totalSaved || 0}</h3>
          </div>
          <div className="bg-[#670D2F]/5 p-4 rounded-2xl text-[#670D2F]">
            <Heart className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300"
        >
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Account Level</span>
            <h3 className="text-lg font-extrabold text-[#670D2F] mt-2.5 uppercase tracking-wide">
              {user?.plan === "premium" || user?.isPremium ? "Premium ⭐" : "Free Plan"}
            </h3>
          </div>
          <div className="bg-[#670D2F]/5 p-4 rounded-2xl text-[#670D2F]">
            <Activity className="w-6 h-6" />
          </div>
        </motion.div>
      </motion.section>

      {/* Chart & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category reflection distribution chart */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#670D2F]" /> Reflections by Category
          </h3>
          {categoriesList.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-100 rounded-2xl">
              Publish a lesson to generate category statistics.
            </div>
          ) : (
            <div className="space-y-4">
              {categoriesList.map((c, i) => {
                const widthPercent = (c.count / maxCount) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{c._id}</span>
                      <span className="text-[#670D2F]">{c.count}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-[#670D2F] to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Shortcuts */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/add-lesson"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#670D2F]/5 text-gray-700 font-bold text-sm transition"
              >
                <PlusCircle className="w-5 h-5 text-[#670D2F]" /> Add New Lesson
              </Link>
              <Link
                href="/dashboard/my-lessons"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#670D2F]/5 text-gray-700 font-bold text-sm transition"
              >
                <BookOpen className="w-5 h-5 text-[#670D2F]" /> Manage My Lessons
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#670D2F]/5 text-gray-700 font-bold text-sm transition"
              >
                <User className="w-5 h-5 text-[#670D2F]" /> View My Profile
              </Link>
            </div>
          </div>
          {!(user?.plan === "premium" || user?.isPremium) && (
            <div className="border-t border-gray-100 pt-4 mt-6">
              <p className="text-xs text-gray-400 mb-3">Unlock all premium wisdom archives.</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/pricing"
                  className="block text-center py-2.5 rounded-xl bg-yellow-400 text-amber-950 font-extrabold text-xs hover:bg-yellow-500 transition shadow"
                >
                  Upgrade to Premium ⭐
                </Link>
              </motion.div>
            </div>
          )}
        </motion.section>
      </div>

      {/* Recent lessons list */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-6">Recently Added Lessons</h3>
        {(!stats?.recentLessons || stats.recentLessons.length === 0) ? (
          <p className="text-gray-400 text-sm py-8 text-center border border-dashed border-gray-100 rounded-2xl">You haven't posted any lessons yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentLessons.map((l, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
                key={l._id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-sm truncate max-w-xs md:max-w-md">{l.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded text-[10px] font-bold">{l.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(l.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  href={`/lesson/${l._id}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#670D2F] hover:underline whitespace-nowrap"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}