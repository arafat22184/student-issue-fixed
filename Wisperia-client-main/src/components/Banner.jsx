"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Star, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

const banners = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000",
];

export default function HeroBanner() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  return (
    <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 px-6 md:px-12 bg-theme shadow-2xl overflow-hidden">
      {/* LEFT: CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-6"
      >
        <div className="inline-flex items-center gap-2 border border-theme bg-muted text-theme px-5 py-2 rounded-full text-sm w-fit font-medium">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>Building a legacy of wisdom</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-theme leading-[1.05]">
          Preserve, Reflect <br />
          <span className="text-primary italic">& Share Wisdom</span>
        </h1>
        <p className="text-muted text-lg max-w-lg leading-relaxed border-l-4 border-primary pl-6">
          Your experiences are valuable. Create, organize, and share life
          lessons on a platform designed for meaningful reflection and personal
          growth.
        </p>
        

        
        <div className="flex flex-wrap gap-4 mt-4">
          <button className="px-8 py-4 rounded-full bg-primary text-white font-bold hover:scale-105 transition shadow-xl flex items-center gap-2">
            Share a Lesson <ArrowRight className="w-5 h-5" />
          </button>

          <button className="px-8 py-4 rounded-full border border-theme text-theme hover:bg-muted transition flex items-center gap-2">
            <Play className="w-4 h-4" /> Watch Demo
          </button>
        </div>
      </motion.div>

      {/* RIGHT: SLIDER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative"
      >
        <div
          ref={emblaRef}
          className="overflow-hidden rounded-[2rem] border-[8px] border-theme shadow-2xl"
        >
          <div className="flex">
            {banners.map((img, i) => (
              <div key={i} className="relative flex-[0_0_100%] h-[450px]">
                <Image
                  src={img}
                  alt="lesson-banner"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent dark:from-black/70" />
              </div>
            ))}
          </div>
        </div>

        {/* Floating Stats Card */}
        <div className="absolute -bottom-10 -left-10 card-theme p-6 rounded-3xl shadow-2xl backdrop-blur-xl hidden md:block">
          <div className="flex gap-8">
            <div>
              <p className="text-theme font-bold text-2xl">5K+</p>
              <p className="text-muted text-sm">Lessons Shared</p>
            </div>

            <div className="w-px bg-border" />

            <div>
              <p className="text-theme font-bold text-2xl">98%</p>
              <p className="text-muted text-sm">Growth Rate</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}