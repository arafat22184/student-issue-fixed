"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";

const Stats = () => {
  const statsData = [
    { label: "Active Learners", value: "15K+", icon: <Users /> },
    { label: "Total Lessons", value: "8.5K+", icon: <BookOpen /> },
    { label: "Growth Rate", value: "99%", icon: <TrendingUp /> },
    { label: "Top Mentors", value: "500+", icon: <Award /> },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#670D2F] p-8 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="mb-4 p-3 bg-white/10 rounded-full text-pink-200">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-extrabold mb-1">{stat.value}</h3>
              <p className="text-pink-100 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;