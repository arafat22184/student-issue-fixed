"use client";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#fcf8f9] flex flex-col items-center justify-center px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-[#670D2F]/5 flex flex-col items-center"
      >
        <XCircle className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-extrabold text-[#670D2F] mb-4">Payment Canceled</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The transaction was canceled and you were not charged. If you experienced an issue with the checkout process, please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/pricing" className="flex-1 text-center bg-[#670D2F] text-white py-3.5 rounded-xl font-bold hover:bg-[#5a0b27] transition-all">
            Try Again
          </Link>
          <Link href="/" className="flex-1 text-center border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition">
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}