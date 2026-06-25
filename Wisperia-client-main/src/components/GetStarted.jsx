"use client";
import React from "react";
import { motion } from "framer-motion";
import { UserPlus, BookOpenText, Share2, Award } from "lucide-react";

const GetStarted = () => {
  const steps = [
    {
      id: "01",
      title: "Create Account",
      desc: "Sign up to join our community and start your journey.",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      id: "02",
      title: "Add Lesson",
      desc: "Document your life experiences and profound insights.",
      icon: <BookOpenText className="w-6 h-6" />,
    },
    {
      id: "03",
      title: "Share Wisdom",
      desc: "Publish your lessons to inspire and guide others.",
      icon: <Share2 className="w-6 h-6" />,
    },
    {
      id: "04",
      title: "Grow Together",
      desc: "Track your impact and see how many lives you've touched.",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-theme/5 border-t border-theme/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-theme mb-4">How to Get Started</h2>
          <p className="text-muted">Follow these 4 simple steps to start sharing your wisdom today.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative card-theme p-8 rounded-[2rem] shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-2 text-6xl font-black text-theme/10">
                {step.id}
              </div>
              
              {/* Icon */}
              <div className="bg-primary text-[var(--background)] p-4 rounded-2xl w-fit mb-6 shadow-sm">
                {step.icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-theme mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GetStarted;