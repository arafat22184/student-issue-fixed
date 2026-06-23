"use client";
import { Button } from "@heroui/react";
import React from "react";
import { Check, Crown, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPremium = user?.plan === "premium" || user?.isPremium;
  const router = useRouter();

  const handleUpgrade = (e) => {
    if (!user) {
      e.preventDefault();
      toast.error("Please sign in to upgrade your account");
      router.push("/signin");
    }
  };

  if (isPremium) {
    return (
      <main className="bg-[#fcf8f9] min-h-screen py-20 px-6 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-yellow-100 shadow-xl text-center">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-6">
            <Star className="w-10 h-10 fill-yellow-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#670D2F] mb-4">Premium Status</h2>
          <span className="text-[#670D2F] font-bold text-xs tracking-[0.2em] uppercase bg-yellow-100 px-6 py-2 rounded-full mb-6 inline-block">Premium Member ⭐</span>
          <p className="text-gray-500 mb-8">Thank you for being a premium contributor! You have full lifetime access to all wisdom archives and creation features.</p>
          <Link href="/dashboard" className="block w-full bg-[#670D2F] text-white py-4 rounded-xl font-bold hover:bg-[#5a0b27] transition-all">
            Go to Dashboard
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="bg-[#fcf8f9] py-20 px-6">
      <section className="text-center mb-16">
        <span className="text-[#670D2F] font-bold text-xs tracking-[0.2em] uppercase bg-[#670D2F]/10 px-6 py-2 rounded-full">Membership Invitation</span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#670D2F] mt-8 mb-6">Invest in your <span className="italic opacity-80">legacy.</span></h1>
        <p className="text-gray-500 max-w-lg mx-auto text-lg">Join the inner circle of wisdom. Unlock the full archive and elevate your mind.</p>
      </section>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#670D2F]/10 shadow-[0_20px_50px_rgba(103,13,47,0.05)]">
        <div>
          <h3 className="text-3xl font-bold text-[#670D2F]">Lifetime Access</h3>
          <p className="text-gray-500 mt-2 mb-8">One simple payment. No subscriptions. No hidden fees. Just pure wisdom, forever.</p>
          
          <ul className="space-y-4 mb-8">
            {["Unlimited access to the archive", "Exclusive 'Deep Dive' content", "Support creators directly"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <Check className="w-5 h-5 text-[#670D2F]" /> {f}
              </li>
            ))}
          </ul>

          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-[#670D2F]">৳1500</span>
            <span className="text-gray-400 text-sm font-semibold">One-time payment</span>
          </div>
          <form action={'/api/subscriptions'} method="POST" onSubmit={handleUpgrade}>
            <Button type="submit" className="w-full bg-[#670D2F] text-white py-6 rounded-2xl font-bold hover:bg-[#5a0b27] transition-all">
              Upgrade Now
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#fcf8f9] border border-[#670D2F]/10 flex items-center gap-4">
            <Zap className="w-8 h-8 text-[#670D2F]" />
            <div><h4 className="font-bold text-[#670D2F]">Creation Unlimited</h4><p className="text-sm text-gray-500">Create and publish without limits.</p></div>
          </div>
          <div className="p-6 rounded-2xl bg-[#fcf8f9] border border-[#670D2F]/10 flex items-center gap-4">
            <Crown className="w-8 h-8 text-[#670D2F]" />
            <div><h4 className="font-bold text-[#670D2F]">Golden Badge</h4><p className="text-sm text-gray-500">Stand out with prestigious status.</p></div>
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto mt-20">
        <h3 className="text-center text-2xl font-bold text-[#670D2F] mb-10">The Distinction</h3>
        <div className="bg-white rounded-3xl border border-[#670D2F]/10 p-8 shadow-sm">
          {[
            { f: "Access to Public Lessons", g: true, m: true },
            { f: "Premium 'Deep Dive' Articles", g: false, m: true },
            { f: "Ad-Free Experience", g: false, m: true },
            { f: "Lesson Creation", g: "10 / month", m: "Unlimited" },
            { f: "Community Badge / Verified Status", g: false, m: true }
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 py-4 border-b border-[#670D2F]/5 last:border-0 items-center">
              <span className="text-sm font-medium text-gray-600">{row.f}</span>
              <span className="text-center text-gray-400">{row.g === true ? <Check className="mx-auto w-4"/> : row.g || "✘"}</span>
              <span className="text-center font-bold text-[#670D2F]">{row.m === true ? <Check className="mx-auto w-4"/> : row.m}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}