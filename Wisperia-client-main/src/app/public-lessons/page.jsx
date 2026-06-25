"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Lock, Search, Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CATEGORIES = ["All", "Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];
const TONES = ["All", "Motivational", "Sad", "Realization", "Gratitude"];

function PublicLessonsList() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isPremiumUser = currentUser?.plan === "premium" || currentUser?.isPremium;

  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdParam = searchParams.get("userId") || "";

  const [lessons, setLessons] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [emotionalTone, setEmotionalTone] = useState("All");
  const [sort, setSort] = useState("newest");

  // Debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Lessons
  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        category,
        emotionalTone,
        sort,
        page: currentPage.toString(),
        limit: "6",
      });
      if (userIdParam) {
        queryParams.set("userId", userIdParam);
      }

      const res = await fetch(`${BACKEND_URL}/public-lessons?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLessons(data.lessons || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Could not load lessons");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, emotionalTone, sort, currentPage, userIdParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [userIdParam]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  return (
    <main className="bg-theme min-h-screen py-16 px-4 md:px-8 text-theme transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-theme mb-4">Public Life Lessons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Explore wisdom and growth insights.</p>
        </section>

        {/* User Filter Status */}
        {userIdParam && (
          <div className="card-theme p-4 rounded-2xl mb-8 flex items-center justify-between shadow-sm border border-primary/20 bg-primary/5">
            <span className="text-sm font-semibold text-theme">
              Showing public lessons shared by{" "}
              <span className="text-primary font-bold">
                {lessons[0]?.creatorName || "this contributor"}
              </span>
            </span>
            <button
              onClick={() => router.push("/public-lessons")}
              className="px-4 py-1.5 bg-primary text-[var(--background)] hover:opacity-90 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Show All Lessons
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <section className="card-theme p-6 rounded-3xl shadow-md mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="col-span-1 md:col-span-2 p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-primary dark:focus:border-white transition"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select 
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer" 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                  {cat}
                </option>
              ))}
            </select>
            <select 
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer" 
              value={emotionalTone}
              onChange={(e) => {
                setEmotionalTone(e.target.value);
                setCurrentPage(1);
              }}
            >
              {TONES.map(tone => (
                <option key={tone} value={tone} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                  {tone}
                </option>
              ))}
            </select>
            <select 
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer" 
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Newest</option>
              <option value="mostSaved" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Most Saved</option>
            </select>
          </div>
        </section>

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="card-theme rounded-3xl p-16 text-center text-gray-400 dark:text-gray-500 border-dashed shadow-sm">
            No public lessons found matching the filters.
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {lessons.map((lesson) => {
                const isLocked = (lesson.accesslevel === "premium" || lesson.accessLevel === "premium") && !isPremiumUser && currentUser?.role !== "admin";

                return (
                  <motion.div key={lesson._id} className="card-theme rounded-3xl p-6 shadow-md flex flex-col relative overflow-hidden min-h-[380px]">

                    {/* Blurred content wrapper when locked */}
                    <div className={`flex-1 flex flex-col ${isLocked ? "filter blur-[4px] pointer-events-none select-none" : ""}`}>
                      <div className="h-48 bg-theme/5 rounded-2xl mb-4 relative overflow-hidden">
                        <Image src={lesson.image || "/favicon.png"} fill alt="lesson" className="object-cover" />
                      </div>
                      <h3 className="font-bold text-theme text-xl mb-2 leading-snug truncate">{lesson.title}</h3>
                      <p className="text-muted text-sm mb-6 flex-1">{lesson.description ? lesson.description.slice(0, 100) + "..." : ""}</p>
                    </div>

                    {/* Unlock overlay / Details Link */}
                    {isLocked ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-theme/40 backdrop-blur-[2px] z-10">
                        <Lock className="w-10 h-10 text-theme mb-3" />
                        <span className="text-[10px] font-black text-amber-900 bg-yellow-400 px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow">
                          Premium Lesson
                        </span>
                        <Link
                          href="/pricing"
                          className="w-full text-center py-3 bg-primary hover:opacity-90 text-[var(--background)] rounded-xl font-bold transition shadow-lg cursor-pointer animate-pulse"
                        >
                          Upgrade to Unlock
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/lesson/${lesson._id}`} className="w-full text-center py-3 bg-primary text-[var(--background)] rounded-xl font-bold hover:opacity-90 transition mt-auto cursor-pointer">
                        See Details
                      </Link>
                    )}

                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer text-theme"
                  title="Previous Page"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-theme">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer text-theme"
                  title="Next Page"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function PublicLessonsPage() {
  return (
    <Suspense fallback={
      <div className="bg-theme min-h-screen py-16 px-4 md:px-8 text-theme transition-all duration-300 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading page...</div>
      </div>
    }>
      <PublicLessonsList />
    </Suspense>
  );
}