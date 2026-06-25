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
    <section className="py-20 px-6 bg-theme/5 border-y border-theme/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-8 rounded-[2rem] flex flex-col items-center justify-center text-theme shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="mb-4 p-3 bg-theme/10 rounded-full text-theme">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-extrabold mb-1 text-theme">{stat.value}</h3>
              <p className="text-muted text-xs font-semibold uppercase tracking-wider text-center">
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