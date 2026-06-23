"use client";
import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { Lock, Search, Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CATEGORIES = ["All", "Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];
const TONES = ["All", "Motivational", "Sad", "Realization", "Gratitude"];

export default function PublicLessonsPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isPremiumUser = currentUser?.plan === "premium" || currentUser?.isPremium;

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
        page: currentPage,
        limit: 6,
      });

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
  }, [debouncedSearch, category, emotionalTone, sort, currentPage]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  return (
    <main className="bg-[#fcf8f9] min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-[#670D2F] mb-4">Public Life Lessons</h1>
          <p className="text-gray-500">Explore wisdom and growth insights.</p>
        </section>

        {/* Search & Filters */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-12">
          <div className="grid md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="col-span-1 md:col-span-2 p-3 border rounded-xl"
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="p-3 border rounded-xl" onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select className="p-3 border rounded-xl" onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="mostSaved">Most Saved</option>
            </select>
          </div>
        </section>

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-20">Loading lessons...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {lessons.map((lesson) => {
              const isLocked = (lesson.accesslevel === "premium") && !isPremiumUser && currentUser?.role !== "admin";
              
              return (
                <motion.div key={lesson._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                  <div className="h-48 bg-gray-100 rounded-2xl mb-4 relative overflow-hidden">
                    <Image src={lesson.image || "/placeholder.webp"} fill alt="lesson" className="object-cover" />
                    {isLocked && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Lock className="text-[#670D2F]" /></div>}
                  </div>
                  <h3 className="font-bold text-[#670D2F] text-xl mb-2">{lesson.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1">{lesson.description.slice(0, 100)}...</p>
                  
                  <Link href={`/lesson/${lesson._id}`} className="w-full text-center py-3 bg-[#670D2F] text-white rounded-xl font-bold">
                    {isLocked ? "Unlock Premium" : "See Details"}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}