"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Bookmark } from "lucide-react";
import Link from "next/link";

const FeaturedLessons = ({ lesson = [] }) => {
  return (
    <section className="py-20 px-6 bg-[#fcf8f9]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-pink-600 font-bold tracking-widest uppercase text-sm">Handpicked Wisdom</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#670D2F] mt-2">Featured Insights</h2>
          </div>
          <Link href="/public-lessons" className="flex items-center gap-2 text-[#670D2F] font-semibold hover:gap-4 transition-all">
            Explore All Lessons <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lesson.map((lesson, i) => (
            <motion.div
              key={lesson._id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Image */}
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={lesson.image} 
                  alt={lesson.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#670D2F]">
                  {lesson.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {lesson.views || 0}</span>
                  <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> {lesson.savedCount || 0}</span>
                </div>
                <h3 className="text-xl font-bold text-[#670D2F] mb-3 group-hover:text-pink-600 transition">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                  {lesson.description}
                </p>
                <Link href={`/lesson/${lesson._id}`} className="block w-full text-center py-3 rounded-xl bg-[#670D2F] text-white font-bold hover:bg-[#5a0b27] transition">
                  Read Insight
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLessons;