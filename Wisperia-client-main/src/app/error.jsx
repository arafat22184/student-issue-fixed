"use client";
import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function RootError({ error, reset }) {
  useEffect(() => {
    // Log the error to an analytics service or logger
    console.error("Application Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] w-full flex flex-col justify-center items-center px-6 py-12 text-center bg-gradient-to-b from-[#fcf8f9] to-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-md bg-white border border-red-100 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-red-950/5 flex flex-col items-center"
      >
        <div className="bg-red-50 p-4 rounded-full text-red-600 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-[#670D2F] mb-3">
          Something went wrong
        </h2>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          An unexpected error occurred while loading this page. This could be due to a lost connection or server latency. Let's try reloading the section.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#670D2F] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#5a0b27] transition shadow-md shadow-[#670D2F]/10 cursor-pointer text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = "/"}
            className="w-full sm:w-auto border border-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-50 transition cursor-pointer text-sm"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
