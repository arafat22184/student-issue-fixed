"use client";

import { addLessons } from "@/lib/api/lesson";
import { imageUpload } from "@/lib/imgUpload";
import { useState } from "react";
import toast from "react-hot-toast";


const CATEGORIES = ["Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];
const TONES = ["Motivational", "Sad", "Realization", "Gratitude"];

const AddLesson = ({ isPremiumUser = false, jwtToken }) => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Publishing your lesson...");

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const imageFile = formData.get("image");
      let imageUrl = "";

      
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await imageUpload(imageFile);
      }

      const lesson = {
        title: data.title,
        description: data.description,
        category: data.category,
        emotionalTone: data.emotionaltone, 
        visibility: data.visibility,
        accessLevel: isPremiumUser ? data.accesslevel : "free",
        image: imageUrl,
        createdAt: new Date().toISOString(),
      };

      const result = await addLessons(lesson, jwtToken);

      if (result?.acknowledged || result?.insertedId) {
        toast.success("Lesson published successfully!", { id: toastId });
        e.target.reset();
      } else {
        throw new Error("Failed to save to database");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong. Try again!", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white">Add New Lesson</h1>
      </header>

      <div className="card-theme rounded-3xl shadow-lg p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Lesson Title</label>
            <input
              name="title"
              required
              type="text"
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-[#670D2F] dark:focus:border-white transition-all"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Cover Image</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              className="w-full p-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm outline-none cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-[#670D2F] dark:focus:border-white transition-all"
            ></textarea>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Category</label>
              <select
                name="category"
                className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Emotional Tone</label>
              <select
                name="emotionaltone"
                className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer"
              >
                {TONES.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility & Access */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Visibility</label>
            <select
              name="visibility"
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="public" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Public (Visible to everyone)</option>
              <option value="private" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Private (Only you can see)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase">Access Level</label>
            <select
              name="accesslevel"
              disabled={!isPremiumUser}
              className={`w-full p-3 border rounded-xl outline-none cursor-pointer ${
                !isPremiumUser
                  ? "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-white dark:bg-[#450117] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
              }`}
            >
              <option value="free" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Free</option>
              <option value="premium" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Premium</option>
            </select>
            {!isPremiumUser && (
              <p className="text-[10px] text-[#670D2F] dark:text-pink-300 mt-1 font-bold">
                Upgrade to Premium to create paid lessons.
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] py-3 rounded-xl font-bold hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Publishing..." : "Publish Life Lesson"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLesson;