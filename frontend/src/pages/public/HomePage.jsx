import React, { useState, useEffect } from 'react';
import { recipeApi, contestApi, announcementApi } from '../../services/api';
import { HomePrologueSection } from './home/HomePrologueSection';
import { HomePanoramaBanner } from './home/HomePanoramaBanner';
import { HomeMasterclassesSection } from './home/HomeMasterclassesSection';
import { HomeRepertoireSection } from './home/HomeRepertoireSection';
import { HomeCompetitiveArenaSection } from './home/HomeCompetitiveArenaSection';
import { HomeWeekendAcademySection } from './home/HomeWeekendAcademySection';

const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80';

export const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [recipeRes, contestRes, announceRes] = await Promise.all([
          recipeApi.getAll(),
          contestApi.getAll({ activeOnly: true }),
          announcementApi.getAll(),
        ]);

        if (!isMounted) return;
        if (recipeRes.data?.success) setRecipes(recipeRes.data.data.slice(0, 3));
        if (contestRes.data?.success) setContests(contestRes.data.data.slice(0, 2));
        if (announceRes.data?.success) setAnnouncements(announceRes.data.data.slice(0, 2));
      } catch (err) {
        if (isMounted) console.error('Error loading home data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="luxury-homepage">
      {/* ── SECTION I: ARCHITECTURAL HERO & 5-STAR DINING SALONS ── */}
      <HomePrologueSection fallbackImage={FALLBACK_RECIPE_IMAGE} />

      {/* ── CINEMATIC ATELIER PANORAMA BANNER & QUOTE ── */}
      <HomePanoramaBanner />

      {/* ── SECTION II: PALE TAUPE FIELD – MASTERCLASSES & TASTING ATELIER ── */}
      <HomeMasterclassesSection fallbackImage={FALLBACK_RECIPE_IMAGE} />

      {/* ── SECTION III: WARM ALABASTER – LATEST FREE RECIPES ── */}
      <HomeRepertoireSection recipes={recipes} fallbackImage={FALLBACK_RECIPE_IMAGE} />

      {/* ── SECTION IV & V: CHARCOAL FIELD – CONTESTS & HALL OF FAME ── */}
      <HomeCompetitiveArenaSection contests={contests} announcements={announcements} />

      {/* ── WEEKEND CULINARY ACADEMY (MEMBERSHIP & LIVE MASTERCLASSES) ── */}
      <HomeWeekendAcademySection fallbackImage={FALLBACK_RECIPE_IMAGE} />
    </div>
  );
};

export default HomePage;
