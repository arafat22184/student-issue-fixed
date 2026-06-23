"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, User, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomeDynamicSections({ topContributors = [], mostSaved = [] }) {
  return (
    <div className="bg-[#fcf8f9] pb-24">
      {/* SECTION 1: TOP CONTRIBUTORS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-pink-600 font-bold tracking-widest uppercase text-sm">
            Community Leaders
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#670D2F] mt-2">
            Top Contributors of the Week
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
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
              className="bg-white rounded-[2rem] border border-[#670D2F]/10 p-6 flex items-center gap-5 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#670D2F]/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#670D2F]/10 flex items-center justify-center text-[#670D2F] font-bold">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1 border-2 border-white">
                  <Award className="w-4 h-4 text-amber-900" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{c.name || "Anonymous"}</h4>
                <p className="text-gray-500 text-sm mt-1">{c.count} lessons shared</p>
                {/* View all lessons by this contributor */}
                <Link
                  href={`/public-lessons?search=${c.name}`}
                  className="inline-flex items-center text-xs font-bold text-[#670D2F] mt-2 hover:underline"
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
          <span className="text-pink-600 font-bold tracking-widest uppercase text-sm">
            Popular Wisdom
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#670D2F] mt-2">
            Most Saved Lessons
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            The most cherished insights stored by the community for daily reflection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mostSaved.map((lesson, i) => (
            <motion.div
              key={lesson._id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {lesson.image ? (
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#670D2F]/5 flex items-center justify-center text-gray-300">
                      Wisdom Image
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#670D2F]">
                    {lesson.category}
                  </div>
                  {lesson.accesslevel === "premium" || lesson.accessLevel === "premium" ? (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-amber-950 font-extrabold text-[10px] px-3 py-1 rounded-full tracking-wide shadow">
                      ⭐ PREMIUM
                    </div>
                  ) : null}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg">
                      <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                      {lesson.likesCount || 0} Saves
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#670D2F] line-clamp-2 mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {lesson.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6 pt-2">
                <Link
                  href={`/lesson/${lesson._id}`}
                  className="block w-full text-center py-3 rounded-xl bg-[#670D2F] text-white font-bold hover:bg-[#5a0b27] transition"
                >
                  See Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
