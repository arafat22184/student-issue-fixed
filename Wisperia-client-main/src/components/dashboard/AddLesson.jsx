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
        <h1 className="text-3xl font-extrabold text-[#670D2F]">Add New Lesson</h1>
      </header>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Lesson Title</label>
            <input name="title" required type="text" className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Cover Image</label>
            <input name="image" type="file" accept="image/*" className="w-full p-2 border border-gray-200 rounded-xl text-sm" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Description</label>
            <textarea name="description" required rows={4} className="w-full p-3 border border-gray-200 rounded-xl outline-none"></textarea>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Category</label>
              <select name="category" className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Emotional Tone</label>
              <select name="emotionaltone" className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Visibility & Access */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Visibility</label>
            <select name="visibility" className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none">
              <option value="public">Public (Visible to everyone)</option>
              <option value="private">Private (Only you can see)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Access Level</label>
            <select name="accesslevel" disabled={!isPremiumUser} className={`w-full p-3 border rounded-xl outline-none ${!isPremiumUser ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
            {!isPremiumUser && (
              <p className="text-[10px] text-[#670D2F] mt-1 font-medium">Upgrade to Premium to create paid lessons.</p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#670D2F] text-white py-3 rounded-xl font-bold hover:bg-[#5a0b27] transition-all disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Life Lesson"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLesson;