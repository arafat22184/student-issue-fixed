"use client";
import React, { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  AlertTriangle,
  Activity,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminDashboardHome() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchStats = useCallback(async () => {
    try {
      const result = await authClient.getAccessToken();
      console.log("Token Result:", result);
      const token = result.accessToken || result.token || result;

      if (!token) {
        toast.error("Authentication token missing.");
        router.push("/signin");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/dashboard-stats`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 403) {
        toast.error("Access Forbidden. Admins only.");
        router.push("/dashboard");
      } else if (res.status === 401) {
        toast.error("Unauthorized. Please login again.");
        router.push("/signin");
      } else {
        toast.error("Failed to fetch admin stats.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Network error: Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, router]);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/signin");
      } else if (session.user?.role !== "admin") {
        toast.error("Access Denied. Admins only.");
        router.push("/dashboard");
      } else {
        fetchStats();
      }
    }
  }, [session, isPending, router, fetchStats]);

  if (isPending || loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#670D2F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  const contributors = stats?.activeContributors || [];
  const maxContributorCount =
    contributors.length > 0 ? Math.max(...contributors.map((c) => c.count)) : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Admin Welcome Banner */}
      <header className="bg-gradient-to-r from-red-950 to-[#670D2F] rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block text-pink-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full">
            🔑 Admin Panel
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-2 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-pink-100/90 text-sm md:text-base max-w-lg leading-relaxed">
            Monitor growth, review flagged lessons, and manage platform
            moderation.
          </p>
        </div>
      </header>

      {/* Analytics stats grids */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers,
            icon: Users,
            color: "text-[#670D2F]",
          },
          {
            label: "Public Lessons",
            value: stats?.totalPublicLessons,
            icon: BookOpen,
            color: "text-[#670D2F]",
          },
          {
            label: "Reported Flags",
            value: stats?.totalReported,
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            label: "Today's Lessons",
            value: stats?.todayNewLessons,
            icon: Calendar,
            color: "text-[#670D2F]",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                {item.label}
              </span>
              <h3 className={`text-3xl font-black mt-2 ${item.color}`}>
                {item.value || 0}
              </h3>
            </div>
            <div className={`p-4 rounded-2xl bg-gray-50 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </section>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[#670D2F]" /> Top Contributors
          </h3>
          {contributors.length === 0 ? (
            <p className="text-gray-400 text-center">No data found.</p>
          ) : (
            <div className="space-y-4">
              {contributors.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>{c.name}</span>
                    <span>{c.count} lessons</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${(c.count / maxContributorCount) * 100}%`,
                      }}
                      className="h-full bg-[#670D2F] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Moderator Tools
          </h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/admin/manage-users"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700"
            >
              Manage Users
            </Link>
            <Link
              href="/dashboard/admin/reported-lessons"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600"
            >
              Reported Lessons
            </Link>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
