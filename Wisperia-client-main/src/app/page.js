import BannerSlider from "@/components/Banner";
import FeaturedLessons from "@/components/FeaturedLessions";
import GetStarted from "@/components/GetStarted";
import Learning from "@/components/Learning";
import Stats from "@/components/Stats";
import HomeDynamicSections from "@/components/HomeDynamicSections";

const BACKEND_URL = process.env.SERVER_URL || "http://localhost:8000";

async function getFeaturedLessons() {
  try {
    const res = await fetch(`${BACKEND_URL}/featured-lessons`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch featured lessons:", err);
    return [];
  }
}

async function getHomeStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/home-stats`, { cache: 'no-store' });
    if (!res.ok) return { topContributors: [], mostSaved: [] };
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch home stats:", err);
    return { topContributors: [], mostSaved: [] };
  }
}

export default async function Home() {
  const featured = await getFeaturedLessons();
  const { topContributors = [], mostSaved = [] } = await getHomeStats();

  return (
    <div>
      <BannerSlider />
      <Stats />
      <Learning />
      
      {featured && featured.length > 0 && (
        <FeaturedLessons lesson={featured} />
      )}
      
      <HomeDynamicSections 
        topContributors={topContributors} 
        mostSaved={mostSaved} 
      />
      
      <GetStarted />
    </div>
  );
}
