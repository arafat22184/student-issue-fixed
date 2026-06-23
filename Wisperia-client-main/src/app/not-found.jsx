import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcf8f9] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-black text-[#670D2F] tracking-widest animate-pulse">404</h1>
        <div className="bg-[#670D2F] text-white px-4 py-1 text-sm rounded rotate-12 absolute -mt-16 ml-36 font-semibold shadow-md">
          Wisdom Lost
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
          This lesson does not exist yet.
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for has either been moved, deleted, or was never written. Let's head back to gather more wisdom.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#670D2F] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#670D2F]/20 hover:bg-[#5a0b27] transition-all hover:scale-105 active:scale-95 duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
