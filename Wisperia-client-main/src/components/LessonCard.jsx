import Link from 'next/link';

const LessonCard = ({ lesson }) => {
    return (
        <div className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow bg-white">
            {lesson.image && (
                <img 
                    src={lesson.image} 
                    alt={lesson.title} 
                    className="w-full h-40 object-cover rounded-xl mb-3" 
                />
            )}
            
            {/* কন্টেন্ট */}
            <h3 className="text-lg font-bold text-gray-800 truncate">{lesson.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lesson.description}</p>
            
            <div className="flex justify-between items-center mt-4 text-xs font-medium text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">{lesson.category}</span>
                <span className={`px-2 py-1 rounded ${lesson.accesslevel === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {lesson.accesslevel}
                </span>
            </div>

            {/* বাটন */}
            <Link href={`/lesson/${lesson._id}`}>
                <button className="w-full mt-4 bg-[#670D2F] text-white py-2 rounded-lg font-semibold hover:bg-[#5a0b27] transition-all">
                    See Details
                </button>
            </Link>
        </div>
    );
};

export default LessonCard;