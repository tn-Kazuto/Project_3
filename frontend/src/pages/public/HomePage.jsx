import React, { useState, useEffect } from 'react';
import { recipeApi, contestApi, announcementApi } from '../../services/api';
import { useOptionalAuth } from '../../context/AuthContext';
import { HomePrologueSection } from './home/HomePrologueSection';
import { HomePanoramaBanner } from './home/HomePanoramaBanner';
import { HomeMasterclassesSection } from './home/HomeMasterclassesSection';
import { HomeRepertoireSection } from './home/HomeRepertoireSection';
import { HomeCompetitiveArenaSection } from './home/HomeCompetitiveArenaSection';
import { HomeWeekendAcademySection } from './home/HomeWeekendAcademySection';

const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80';

export const HomePage = () => {
  const { isAuthenticated } = useOptionalAuth();
  const [recipes, setRecipes] = useState([]);
  const [memberPreviews, setMemberPreviews] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [recipeResult, memberPreviewResult, contestResult, announceResult] = await Promise.allSettled([
          recipeApi.getAll({ isFreeOnly: true }),
          recipeApi.getAll({ isFreeOnly: false, includePreviews: !isAuthenticated }),
          contestApi.getAll({ activeOnly: true }),
          announcementApi.getAll(),
        ]);

        if (!isMounted) return;
        if (recipeResult.status === 'fulfilled' && recipeResult.value?.data?.success) {
          const freeItems = Array.isArray(recipeResult.value.data.data) ? recipeResult.value.data.data : [];
          setRecipes(freeItems.slice(0, 3));
        }
        if (memberPreviewResult.status === 'fulfilled' && memberPreviewResult.value?.data?.success) {
          const memberItems = Array.isArray(memberPreviewResult.value.data.data)
            ? memberPreviewResult.value.data.data.filter((item) => !item.isFree)
            : [];
          setMemberPreviews(memberItems.slice(0, 3));
        }
        if (contestResult.status === 'fulfilled' && contestResult.value?.data?.success) {
          setContests((contestResult.value.data.data || []).slice(0, 2));
        }
        if (announceResult.status === 'fulfilled' && announceResult.value?.data?.success) {
          setAnnouncements((announceResult.value.data.data || []).slice(0, 2));
        }
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
  }, [isAuthenticated]);

  return (
    <div className="luxury-homepage">
      {/* ── SECTION I: ARCHITECTURAL HERO & 5-STAR DINING SALONS ── */}
      <HomePrologueSection fallbackImage={FALLBACK_RECIPE_IMAGE} />

      {/* ── CINEMATIC ATELIER PANORAMA BANNER & QUOTE ── */}
      <HomePanoramaBanner />

      {/* ── SECTION II: PALE TAUPE FIELD – MASTERCLASSES & TASTING ATELIER ── */}
      <HomeMasterclassesSection fallbackImage={FALLBACK_RECIPE_IMAGE} />

      {/* ── SECTION III: WARM ALABASTER – LATEST FREE RECIPES & MEMBERS PREVIEWS ── */}
      <HomeRepertoireSection
        recipes={recipes}
        memberPreviews={memberPreviews}
        isAuthenticated={isAuthenticated}
        fallbackImage={FALLBACK_RECIPE_IMAGE}
      />

      {/* ── SECTION IV & V: CHARCOAL FIELD – CONTESTS & HALL OF FAME ── */}
      <HomeCompetitiveArenaSection contests={contests} announcements={announcements} />

      {/* ── WEEKEND CULINARY ACADEMY (MEMBERSHIP & LIVE MASTERCLASSES) ── */}
      <HomeWeekendAcademySection fallbackImage={FALLBACK_RECIPE_IMAGE} />
    </div>
  );
};

export default HomePage;
