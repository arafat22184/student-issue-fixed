"use client";
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Lightbulb, TrendingUp, ShieldCheck } from "lucide-react";

const Learning = () => {
  const benefits = [
    {
      title: "Preserve Wisdom",
      desc: "Your life experiences are a treasure. Document them before they fade.",
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      title: "Reflective Growth",
      desc: "Review your past actions to become a wiser version of yourself.",
      icon: <Lightbulb className="w-8 h-8" />,
    },
    {
      title: "Community Impact",
      desc: "Share your lessons to guide someone else through their challenges.",
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      title: "Secure Legacy",
      desc: "A safe, private, and permanent space for your personal evolution.",
      icon: <ShieldCheck className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#670D2F]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Learning From Life Matters
          </h2>
          <p className="text-pink-200 text-lg">
            Every realization is a step forward. Let&apos;s document your journey.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-pink-300 mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-pink-100 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Learning;