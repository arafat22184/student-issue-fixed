"use client";
import React from "react";
import { motion } from "framer-motion";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#fcf8f9] to-white px-4">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#670D2F]/20 border-t-[#670D2F] rounded-full"
        />
        {/* Inner pulsing logo circle */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-8 h-8 bg-[#670D2F]/10 rounded-full flex items-center justify-center font-bold text-[#670D2F] text-xs"
        >
          🌿
        </motion.div>
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 font-bold text-sm tracking-wide"
      >
        Loading wisdom...
      </motion.p>
    </div>
  );
}
