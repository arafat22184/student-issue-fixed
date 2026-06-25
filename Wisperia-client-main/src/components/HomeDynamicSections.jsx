"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, User, Award, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function HomeDynamicSections({ topContributors = [], mostSaved = [] }) {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isPremiumUser = currentUser?.plan === "premium" || currentUser?.isPremium;

  return (
    <div className="bg-theme pb-24">
      {/* SECTION 1: TOP CONTRIBUTORS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-theme/70 font-bold tracking-widest uppercase text-xs">
            Community Leaders
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-theme mt-2">
            Top Contributors of the Week
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            These active minds have shared the most wisdom with our community recently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topContributors.map((c, i) => (
            <motion.div
              key={c._id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="card-theme rounded-[2rem] p-6 flex items-center gap-5 shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-theme/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-theme/10 flex items-center justify-center text-theme font-bold">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1 border-2 border-white">
                  <Award className="w-4 h-4 text-amber-900" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-theme text-lg leading-tight">{c.name || "Anonymous"}</h4>
                <p className="text-muted text-sm mt-1">{c.count} lessons shared</p>
                {/* View all lessons by this contributor */}
                <Link
                  href={`/public-lessons?userId=${c._id}`}
                  className="inline-flex items-center text-xs font-bold text-theme mt-2 hover:underline"
                >
                  View lessons <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: MOST SAVED LESSONS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-theme/70 font-bold tracking-widest uppercase text-xs">
            Popular Wisdom
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-theme mt-2">
            Most Saved Lessons
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            The most cherished insights stored by the community for daily reflection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mostSaved.map((lesson, i) => {
            const isLocked = (lesson.accesslevel === "premium" || lesson.accessLevel === "premium") && !isPremiumUser && currentUser?.role !== "admin";

            return (
              <motion.div
                key={lesson._id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-theme rounded-[2rem] shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between relative min-h-[480px]"
              >
                {/* Blurred content wrapper when locked */}
                <div className={`flex-1 flex flex-col justify-between ${isLocked ? "filter blur-[4px] pointer-events-none select-none" : ""}`}>
                  <div>
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-theme/5">
                      {lesson.image ? (
                        <img
                          src={lesson.image}
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-theme/5 flex items-center justify-center text-muted">
                          Wisdom Image
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-theme/80 text-theme backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold z-10 border border-theme/20 shadow-sm">
                        {lesson.category}
                      </div>
                      {lesson.accesslevel === "premium" || lesson.accessLevel === "premium" ? (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-amber-950 font-extrabold text-[10px] px-3 py-1 rounded-full tracking-wide shadow z-10">
                          ⭐ PREMIUM
                        </div>
                      ) : null}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-theme font-bold bg-theme/10 border border-theme/10 px-2.5 py-1 rounded-lg">
                          <Heart className="w-3.5 h-3.5 fill-theme text-theme" />
                          {lesson.likesCount || 0} Saves
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-theme line-clamp-2 mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-muted text-sm line-clamp-3">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button Placeholder (blurred) */}
                  <div className="px-6 pb-6 pt-2">
                    <div className="w-full text-center py-3 rounded-xl bg-primary text-[var(--background)] font-extrabold shadow hover:opacity-90 transition">
                      See Details
                    </div>
                  </div>
                </div>

                {/* Overlay upgrade option when locked */}
                {isLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-theme/40 backdrop-blur-[2px] z-20">
                    <Lock className="w-10 h-10 text-theme mb-3" />
                    <span className="text-[10px] font-black text-amber-900 bg-yellow-400 px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow">
                      Premium Lesson
                    </span>
                    <Link 
                      href="/pricing" 
                      className="w-full text-center py-3 bg-primary hover:opacity-90 text-[var(--background)] rounded-xl font-bold transition shadow-lg cursor-pointer"
                    >
                      Upgrade to Unlock
                    </Link>
                  </div>
                ) : (
                  <Link href={`/lesson/${lesson._id}`} className="absolute inset-0 z-10" />
                )}

              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
