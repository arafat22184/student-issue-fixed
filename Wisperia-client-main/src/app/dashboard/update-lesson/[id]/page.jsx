"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, getToken } from "@/lib/auth-client";
import { imageUpload } from "@/lib/imgUpload";
import toast from "react-hot-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"];
const TONES = ["Motivational", "Sad", "Realization", "Gratitude"];

export default function UpdateLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isPremiumUser = currentUser?.plan === "premium" || currentUser?.isPremium;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES);
  const [emotionalTone, setEmotionalTone] = useState(TONES);
  const [visibility, setVisibility] = useState("public");
  const [accessLevel, setAccessLevel] = useState("free");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  useEffect(() => {
    if (!id || !currentUser) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/lessons/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Authority check
        if (data.userId !== currentUser.id && currentUser.role !== "admin") {
          toast.error("Unauthorized!");
          router.push("/dashboard/my-lessons");
          return;
        }

        setLesson(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setEmotionalTone(data.emotionalTone || data.emotionaltone);
        setVisibility(data.visibility);
        setAccessLevel(data.accessLevel || data.accesslevel);
        setCurrentImageUrl(data.image);
      } catch (err) {
        toast.error("Failed to load lesson");
        router.push("/dashboard/my-lessons");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, currentUser]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const fileInput = e.target.image.files;
      let imageUrl = currentImageUrl;

      if (fileInput && fileInput.length > 0) {
        imageUrl = await imageUpload(fileInput[0]);
      }

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/lessons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          emotionalTone,
          visibility,
          accessLevel: isPremiumUser ? accessLevel : "free",
          image: imageUrl
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success("Lesson updated successfully!", { id: toastId });
      router.push("/dashboard/my-lessons");
    } catch (err) {
      toast.error("Update failed!", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-[#670D2F] dark:text-white">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <header className="mb-8 flex items-center gap-4">
        <Link 
          href="/dashboard/my-lessons" 
          className="p-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-theme hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-extrabold text-[#670D2F] dark:text-white">Update Lesson</h1>
      </header>

      <div className="card-theme rounded-3xl p-8 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Title</label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-[#670D2F] dark:focus:border-white transition" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Cover Image</label>
            {currentImageUrl && <img src={currentImageUrl} className="h-32 w-full object-cover rounded-xl mb-2" />}
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              className="w-full text-sm border border-gray-200 dark:border-white/10 p-2 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none cursor-pointer" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-2">Description</label>
            <textarea 
              required 
              rows={5} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:border-[#670D2F] dark:focus:border-white transition"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
            <select 
              value={emotionalTone} 
              onChange={(e) => setEmotionalTone(e.target.value)} 
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#450117] text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {TONES.map(t => (
                <option key={t} value={t} className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <select 
            value={accessLevel} 
            onChange={(e) => setAccessLevel(e.target.value)} 
            disabled={!isPremiumUser} 
            className={`w-full p-3 border rounded-xl cursor-pointer ${
              !isPremiumUser 
                ? "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                : "bg-white dark:bg-[#450117] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            }`}
          >
            <option value="free" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Free</option>
            <option value="premium" className="bg-white dark:bg-[#450117] text-gray-900 dark:text-white">Premium</option>
          </select>

          <button 
            disabled={updating} 
            className="w-full bg-[#670D2F] dark:bg-white text-white dark:text-[#670D2F] py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#5a0b27] dark:hover:bg-gray-100 transition cursor-pointer shadow-md disabled:opacity-50"
          >
            {updating ? <RefreshCw className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}