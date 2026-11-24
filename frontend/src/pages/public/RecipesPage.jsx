import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi, tipApi, categoryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CulinarySkeleton } from '../../components/common/CulinarySkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { PageBanner } from '../../components/common/PageBanner';

const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80';
const CULINARY_SVG_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="%23242320"/><rect x="30" y="30" width="740" height="390" stroke="%23c5a880" stroke-width="1.5" stroke-dasharray="6 4" fill="none"/><circle cx="400" cy="180" r="44" stroke="%23c5a880" stroke-width="2" fill="%231a1918"/><path d="M380 185C380 170 390 160 400 160C410 160 420 170 420 185H380Z" fill="%23c5a880"/><rect x="375" y="187" width="50" height="4" rx="2" fill="%23c5a880"/><circle cx="400" cy="154" r="4" fill="%23c5a880"/><text x="400" y="270" text-anchor="middle" fill="%23fcfbf7" font-family="serif" font-size="20" letter-spacing="3">CHEF JAMES THEW</text><text x="400" y="300" text-anchor="middle" fill="%23c5a880" font-family="monospace" font-size="12" letter-spacing="4">5-STAR CULINARY ATELIER</text></svg>`;

export const RecipesPage = ({ initialTab = 'recipes' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'recipes' or 'tips'
  const [recipes, setRecipes] = useState([]);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // 'all', 'free', 'members'
  const [formatFilter, setFormatFilter] = useState('ALL'); // 'ALL', 'ARTICLE', 'VIDEO', 'TALKSHOW', 'LIVESHOW'
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [selectedTip, setSelectedTip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [totalItems, setTotalItems] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Handle explicit pagination button clicks: smoothly scroll up to catalog section
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const catalogEl = document.getElementById('catalog-content-section');
      if (catalogEl && typeof catalogEl.scrollIntoView === 'function') {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Fetch recipes or tips based on filters & page
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const params = {
          page: currentPage,
          pageSize,
        };
        if (selectedCategory) params.categoryId = selectedCategory;
        if (tierFilter === 'free') params.isFreeOnly = true;
        else if (tierFilter === 'members') params.isFreeOnly = false;
        if (formatFilter !== 'ALL') params.contentType = formatFilter;

        if (activeTab === 'recipes') {
          if (searchTerm.trim()) params.search = searchTerm.trim();
          const res = await recipeApi.getAll(params);
          if (!isMounted) return;
          if (res.data?.success) {
            let data = res.data.data;
            let items = [];
            let total = 0;
            if (Array.isArray(data)) {
              if (formatFilter !== 'ALL') {
                data = data.filter((r) => (r.contentType || 'ARTICLE').toUpperCase() === formatFilter.toUpperCase());
              }
              items = data;
              total = data.length;
            } else if (data && Array.isArray(data.items)) {
              items = data.items;
              if (formatFilter !== 'ALL') {
                items = items.filter((r) => (r.contentType || 'ARTICLE').toUpperCase() === formatFilter.toUpperCase());
              }
              total = data.totalCount || items.length;
            }

            // Keep current page if valid; only adjust if currentPage exceeds max available pages
            const maxPage = Math.max(1, Math.ceil(total / pageSize));
            if (currentPage > maxPage) {
              setCurrentPage(maxPage);
              return;
            }

            setRecipes(items);
            setTotalItems(total);
          }

          // Concurrently ensure cooking tips count is available for the tab switcher
          if (tips.length === 0 || searchTerm.trim()) {
            const tipParams = {};
            if (searchTerm.trim()) tipParams.search = searchTerm.trim();
            tipApi.getAll(tipParams)
              .then((tipRes) => {
                if (!isMounted || !tipRes.data?.success) return;
                const tipData = tipRes.data.data;
                if (Array.isArray(tipData)) {
                  setTips(tipData);
                } else if (tipData && Array.isArray(tipData.items)) {
                  setTips(tipData.items);
                }
              })
              .catch(() => {
                // Gracefully ignore if tips endpoint fails or is unmocked in test suites
              });
          }
        } else {
          if (searchTerm.trim()) params.search = searchTerm.trim();
          const res = await tipApi.getAll(params);
          if (!isMounted) return;
          if (res.data?.success) {
            let data = res.data.data;
            let items = [];
            let total = 0;
            if (Array.isArray(data)) {
              items = data;
              total = data.length;
            } else if (data && Array.isArray(data.items)) {
              items = data.items;
              total = data.totalCount || data.items.length;
            }

            // Keep current page if valid; only adjust if currentPage exceeds max available pages
            const maxPage = Math.max(1, Math.ceil(total / pageSize));
            if (currentPage > maxPage) {
              setCurrentPage(maxPage);
              return;
            }

            setTips(items);
            setTotalItems(total);
          }

          // Concurrently ensure recipes count is available for the tab switcher
          if (recipes.length === 0 || searchTerm.trim()) {
            const recipeParams = {};
            if (searchTerm.trim()) recipeParams.search = searchTerm.trim();
            recipeApi.getAll(recipeParams)
              .then((recipeRes) => {
                if (!isMounted || !recipeRes.data?.success) return;
                const recipeData = recipeRes.data.data;
                if (Array.isArray(recipeData)) {
                  setRecipes(recipeData);
                } else if (recipeData && Array.isArray(recipeData.items)) {
                  setRecipes(recipeData.items);
                }
              })
              .catch(() => {
                // Gracefully ignore if recipes endpoint fails or is unmocked
              });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading recipes/tips:', err);
        setLoadError('The culinary library could not be loaded. Check your connection and try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCategory, searchTerm, tierFilter, formatFilter, currentPage, retryKey]);

  const handleCardClick = (item, isRecipe = true) => {
    if (isRecipe) {
      navigate(`/recipes/${item.recipeId}`);
      return;
    }
    if (!item.isFree && !isAuthenticated) {
      navigate('/register', {
        state: { message: 'This culinary secret is exclusive to registered members. Please subscribe to unlock!' },
      });
      return;
    }
    setSelectedTip(item);
  };

  const visualCategories = [
    {
      name: 'Juices & Nectars',
      matchName: 'juice',
      tag: '01 · REFRESHMENT',
      desc: 'Cold-pressed botanical infusions & revitalizing smoothies',
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Vegetarian Gastronomy',
      matchName: 'vegetarian',
      excludeName: 'non',
      tag: '02 · PLANT-FORWARD',
      desc: 'Wild truffles, garden harvest & seasonal fine-dining',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Prime Cuts & Meats',
      matchName: 'non-vegetarian',
      tag: '03 · ROBUST FEASTS',
      desc: 'Dry-aged Wagyu steaks, roasted game & poultry reductions',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Artisanal Italian',
      matchName: 'italian',
      tag: '04 · CLASSIC HERITAGE',
      desc: 'Handmade bronze-die pastas, creamy risottos & velvety tiramisù',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleVisualCategoryClick = (visualCat) => {
    const target = categories.find((c) => {
      const name = c.categoryName.toLowerCase();
      if (visualCat.excludeName && name.includes(visualCat.excludeName)) return false;
      return name.includes(visualCat.matchName);
    });
    if (target) {
      setSelectedCategory(selectedCategory === target.categoryId ? null : target.categoryId);
    }
  };

  const isCategorySelected = (visualCat) => {
    if (selectedCategory === null) return false;
    const target = categories.find((c) => {
      const name = c.categoryName.toLowerCase();
      if (visualCat.excludeName && name.includes(visualCat.excludeName)) return false;
      return name.includes(visualCat.matchName);
    });
    return target && target.categoryId === selectedCategory;
  };

  return (
    <div className="container py-5 luxury-recipes">
      {/* 5-Star Hotel Haute Cuisine Header Banner */}
      <PageBanner
        tag="III · ARCHITECTURAL CATALOG"
        title="Culinary Library"
        subtitle="Culinary recipes and professional cooking tips across four core cuisines."
        imageUrl="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Catalog Subheader & Tab Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div>
          <span className="font-monospace small text-uppercase text-muted" style={{ letterSpacing: '0.12em' }}>
            ARCHIVAL GASTRONOMY &middot; FIVE-STAR COLLECTION
          </span>
        </div>

        {/* Tab Switcher: Recipes vs Tips */}
        <div className="d-flex gap-2 mt-3 mt-md-0 border p-1" style={{ borderColor: 'var(--dp-color-rule)', backgroundColor: '#ffffff' }}>
          <button
            type="button"
            className="btn btn-sm px-4 py-2"
            style={{
              backgroundColor: activeTab === 'recipes' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'recipes' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: 'none',
              borderRadius: 0,
            }}
            onClick={() => setActiveTab('recipes')}
          >
            <span>Recipes ({recipes.length})</span>
          </button>
          <button
            type="button"
            className="btn btn-sm px-4 py-2"
            style={{
              backgroundColor: activeTab === 'tips' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'tips' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: 'none',
              borderRadius: 0,
            }}
            onClick={() => setActiveTab('tips')}
          >
            <span>Cooking Tips ({tips.length})</span>
          </button>
        </div>
      </div>

      {/* Visual Category Pillars (4 Pillars of Gastronomy) */}
      {activeTab === 'recipes' && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="font-monospace small text-uppercase" style={{ letterSpacing: '0.14em', color: 'var(--dp-color-accent)' }}>
              FOUR PILLARS OF CHEF JAMES THEW &middot; VISUAL DIRECTORY
            </span>
            {selectedCategory !== null && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none font-monospace small"
                style={{ color: 'var(--dp-color-ink-2)' }}
                onClick={() => setSelectedCategory(null)}
              >
                [Clear Filter]
              </button>
            )}
          </div>
          <div className="row g-3">
            {visualCategories.map((vCat, idx) => {
              const selected = isCategorySelected(vCat);
              return (
                <div key={idx} className="col-6 col-lg-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleVisualCategoryClick(vCat)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleVisualCategoryClick(vCat)}
                    className="position-relative overflow-hidden text-white h-100 p-3 d-flex flex-column justify-content-end"
                    style={{
                      minHeight: '160px',
                      backgroundImage: `linear-gradient(rgba(20, 18, 16, ${selected ? '0.65' : '0.78'}), rgba(20, 18, 16, ${selected ? '0.85' : '0.92'})), url("${vCat.imageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: selected ? '2px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
                      boxShadow: selected ? '0 0 15px rgba(182, 147, 85, 0.35)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span className="font-monospace text-uppercase" style={{ fontSize: '0.65rem', color: selected ? 'var(--dp-color-accent)' : 'var(--dp-color-on-field-2)', letterSpacing: '0.12em' }}>
                      {vCat.tag}
                    </span>
                    <h5 className="brand-font m-0 mt-1" style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                      {vCat.name}
                    </h5>
                    <p className="small mb-0 mt-1 d-none d-md-block" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.3' }}>
                      {vCat.desc}
                    </p>
                    <div className="mt-2 pt-2 border-top border-secondary font-monospace" style={{ fontSize: '0.65rem', color: selected ? 'var(--dp-color-accent)' : 'rgba(255, 255, 255, 0.6)' }}>
                      {selected ? 'ACTIVE &bull; CLICK TO RESET' : 'SELECT CATEGORY &rarr;'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div
        id="catalog-content-section"
        className="p-4 mb-5"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
        }}
      >
        <div className="row g-4 align-items-center">
          {/* Keyword Search */}
          <div className="col-lg-6">
            <input
              type="text"
              className="form-control"
              style={{ borderColor: 'var(--dp-color-rule)' }}
              placeholder={
                activeTab === 'recipes'
                  ? 'Search recipes by dish name, chicken, pasta, spices...'
                  : 'Search tips by keyword...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter for Recipes */}
          {activeTab === 'recipes' && (
            <div className="col-lg-6">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <button
                  type="button"
                  className={`btn btn-sm ${selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{
                    backgroundColor: selectedCategory === null ? 'var(--dp-color-field)' : 'transparent',
                    color: selectedCategory === null ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: selectedCategory === null ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.categoryId}
                    type="button"
                    className={`btn btn-sm ${selectedCategory === c.categoryId ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{
                      backgroundColor: selectedCategory === c.categoryId ? 'var(--dp-color-field)' : 'transparent',
                      color: selectedCategory === c.categoryId ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                      borderColor: selectedCategory === c.categoryId ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                      borderRadius: 0,
                    }}
                    onClick={() => setSelectedCategory(c.categoryId)}
                  >
                    {c.categoryName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tier Filter: All vs Free vs Members-only */}
          <div className="col-12 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ borderColor: 'var(--dp-color-rule)' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-uppercase fw-semibold text-muted" style={{ letterSpacing: '0.12em' }}>
                Access Tier:
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${tierFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: 0 }}
                  onClick={() => setTierFilter('all')}
                >
                  All Repertoire
                </button>
                <button
                  type="button"
                  className={`btn ${tierFilter === 'free' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: 0 }}
                  onClick={() => setTierFilter('free')}
                >
                  Free Access Only
                </button>
                <button
                  type="button"
                  className={`btn ${tierFilter === 'members' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: 0 }}
                  onClick={() => setTierFilter('members')}
                >
                  Member Reserved
                </button>
              </div>
            </div>

            <span className="small text-muted font-monospace">
              Showing {activeTab === 'recipes' ? recipes.length : tips.length} items
            </span>
          </div>

          {/* Media Format Filter (SRS Phase U2) - Recipes Tab Only */}
          {activeTab === 'recipes' && (
            <div className="col-12 pt-3 border-top d-flex flex-wrap align-items-center gap-2" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <span className="small text-uppercase fw-semibold text-muted" style={{ letterSpacing: '0.12em' }}>
                Format:
              </span>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{
                    backgroundColor: formatFilter === 'ALL' ? 'var(--dp-color-field)' : 'transparent',
                    color: formatFilter === 'ALL' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: formatFilter === 'ALL' ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                  }}
                  onClick={() => setFormatFilter('ALL')}
                >
                  <span>All Formats</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{
                    backgroundColor: formatFilter === 'ARTICLE' ? 'var(--dp-color-field)' : 'transparent',
                    color: formatFilter === 'ARTICLE' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: formatFilter === 'ARTICLE' ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                  }}
                  onClick={() => setFormatFilter('ARTICLE')}
                >
                  <span>Articles</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{
                    backgroundColor: formatFilter === 'VIDEO' ? 'var(--dp-color-field)' : 'transparent',
                    color: formatFilter === 'VIDEO' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: formatFilter === 'VIDEO' ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                  }}
                  onClick={() => setFormatFilter('VIDEO')}
                >
                  <span>Video Masterclass</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{
                    backgroundColor: formatFilter === 'TALKSHOW' ? 'var(--dp-color-field)' : 'transparent',
                    color: formatFilter === 'TALKSHOW' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: formatFilter === 'TALKSHOW' ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                  }}
                  onClick={() => setFormatFilter('TALKSHOW')}
                >
                  <span>Culinary Talkshows</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm px-3"
                  style={{
                    backgroundColor: formatFilter === 'LIVESHOW' ? 'var(--dp-color-field)' : 'transparent',
                    color: formatFilter === 'LIVESHOW' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
                    borderColor: formatFilter === 'LIVESHOW' ? 'var(--dp-color-accent)' : 'var(--dp-color-rule)',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                  }}
                  onClick={() => setFormatFilter('LIVESHOW')}
                >
                  <span>Live Shows</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <CulinarySkeleton count={6} />
      ) : loadError ? (
        <div className="p-4 border text-center" role="alert" style={{ borderColor: 'var(--dp-color-rule)', backgroundColor: '#ffffff' }}>
          <h2 className="brand-font h3">The recipes are temporarily unavailable</h2>
          <p className="small text-muted">{loadError}</p>
          <button type="button" className="btn btn-primary" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>
        </div>
      ) : activeTab === 'recipes' ? (
        /* Recipes Grid */
        <div className="row g-4">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <div key={r.recipeId} className="col-md-6 col-lg-4">
                <Link
                  to={!isAuthenticated && !r.isFree && r.accessLevel !== 'PREVIEW'
                    ? '/register'
                    : `/recipes/${r.recipeId}`}
                  state={!isAuthenticated && !r.isFree && r.accessLevel !== 'PREVIEW'
                    ? { message: 'This members-only recipe is available to registered subscribers.' }
                    : undefined}
                  aria-label={`View recipe ${r.title}`}
                  className="card h-100 p-4 text-decoration-none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--dp-color-rule)',
                    borderRadius: 0,
                    color: 'inherit',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-1">
                      <span className="badge bg-light text-dark border font-monospace">
                        {r.categoryName}
                      </span>
                      {r.contentType === 'VIDEO' && (
                        <span className="badge font-monospace text-uppercase" style={{ backgroundColor: 'var(--dp-color-accent)', color: '#ffffff', borderRadius: 0 }}>
                          Video
                        </span>
                      )}
                      {r.contentType === 'TALKSHOW' && (
                        <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#2c3e50', color: '#ffffff', borderRadius: 0 }}>
                          Talkshow
                        </span>
                      )}
                      {r.contentType === 'LIVESHOW' && (
                        <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#c0392b', color: '#ffffff', borderRadius: 0 }}>
                          Live
                        </span>
                      )}
                    </div>
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: r.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                        color: '#ffffff',
                        borderRadius: 0,
                      }}
                    >
                      {r.isFree ? 'Free Access' : 'Members Only'}
                    </span>
                    {r.accessLevel === 'PREVIEW' && (
                      <span className="badge font-monospace" style={{ backgroundColor: 'var(--dp-color-ground-2)', color: 'var(--dp-color-ink)' }}>
                        Preview available
                      </span>
                    )}
                  </div>

                  <div className="mb-3 overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}>
                    <img
                      src={r.imageUrl || FALLBACK_RECIPE_IMAGE}
                      alt={r.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = CULINARY_SVG_PLACEHOLDER;
                      }}
                    />
                  </div>

                  <h4 className="brand-font mb-2 text-dark" style={{ fontSize: '1.35rem' }}>
                    {r.title}
                  </h4>

                  <p className="text-muted small mb-3 flex-grow-1" style={{ lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.accessLevel === 'PREVIEW'
                      ? 'Open to read the first part of this members-only recipe.'
                      : r.ingredients
                        ? <><strong className="text-dark">Ingredients:</strong> {r.ingredients.substring(0, 100)}...</>
                        : 'Open the recipe to see its ingredients and cooking method.'}
                  </p>

                  <div
                    className="pt-3 border-top d-flex justify-content-between align-items-center small"
                    style={{ borderColor: 'var(--dp-color-rule)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        {r.authorName}
                      </span>
                      {r.shareCount > 0 && (
                        <span className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                          {r.shareCount} shares
                        </span>
                      )}
                    </div>
                    <span className="text-uppercase fw-semibold gold-underline" style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}>
                      <span>View &rarr;</span>
                    </span>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Repertoire Found"
              message="No recipes match your criteria. Try adjusting your search term or category."
              quote="“Perfection is not when there is nothing left to add, but when there is nothing left to take away.” — Chef James Thew"
              actionLabel="Reset Search & Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory(null);
                setTierFilter('all');
                setFormatFilter('ALL');
              }}
            />
          )}
        </div>
      ) : (
        /* Cooking Tips Grid */
        <div className="row g-4">
          {tips.length > 0 ? (
            tips.map((t) => (
              <div key={t.tipId} className="col-md-6">
                <div
                  className="card h-100 p-4"
                  role="button"
                  tabIndex={0}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--dp-color-rule)',
                    borderRadius: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onClick={() => handleCardClick(t, false)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(t, false); } }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="text-uppercase small fw-bold font-monospace" style={{ letterSpacing: '0.14em', color: 'var(--dp-color-accent-text)' }}>
                        Kitchen Tip
                      </span>
                    </div>
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: t.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                        color: '#ffffff',
                        borderRadius: 0,
                      }}
                    >
                      {t.isFree ? 'Free Access' : 'Members Only'}
                    </span>
                  </div>

                  <h4 className="brand-font mb-2 text-dark" style={{ fontSize: '1.35rem' }}>
                    {t.title}
                  </h4>
                  <p className="text-muted small mb-3" style={{ lineHeight: '1.7' }}>
                    {t.content}
                  </p>

                  {t.videoUrl && (
                    <div className="mb-3">
                      <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.72rem', borderRadius: 0 }}>
                        ▶ Masterclass Video Included
                      </span>
                    </div>
                  )}

                  <div
                    className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center small text-muted font-monospace"
                    style={{ borderColor: 'var(--dp-color-rule)', fontSize: '0.75rem' }}
                  >
                    <span>By {t.authorName}</span>
                    <span className="gold-underline text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                      Read Technique &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Masterclass Tips Found"
              message="No tips found matching your search."
              quote="“Culinary technique is the bridge between raw passion and exceptional hospitality.” — Chef James Thew"
              actionLabel="Reset Tip Search"
              onAction={() => setSearchTerm('')}
            />
          )}
        </div>
      )}

      {/* Architectural Pagination Controls (PERF-09) */}
      {totalItems > pageSize && (
        <nav aria-label="Catalog pagination" className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-3 font-monospace">
          <button
            className="btn btn-sm btn-outline-dark"
            style={{ borderRadius: 0, letterSpacing: '0.1em' }}
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          >
            &larr; PREVIOUS
          </button>
          <span className="small text-muted">
            PAGE {currentPage} OF {Math.max(1, Math.ceil(totalItems / pageSize))} ({totalItems} ITEMS)
          </span>
          <button
            className="btn btn-sm btn-outline-dark"
            style={{ borderRadius: 0, letterSpacing: '0.1em' }}
            disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            onClick={() => handlePageChange(Math.min(Math.ceil(totalItems / pageSize), currentPage + 1))}
          >
            NEXT &rarr;
          </button>
        </nav>
      )}

      {/* Culinary Technique & Tip Modal */}
      {selectedTip && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(38, 35, 33, 0.75)', zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 0, border: '1px solid var(--dp-color-rule)' }}>
              <div className="modal-header py-3 px-4" style={{ backgroundColor: 'var(--dp-color-field)', color: '#ffffff' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="font-monospace small" style={{ color: 'var(--dp-color-accent)' }}>KITCHEN TECHNIQUE</span>
                  <span
                    className="badge font-monospace"
                    style={{ backgroundColor: selectedTip.isFree ? '#1b4d3e' : 'var(--dp-color-accent)', borderRadius: 0 }}
                  >
                    {selectedTip.isFree ? 'Free Access' : 'Members Only'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTip(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4" style={{ backgroundColor: 'var(--dp-color-ground-1)' }}>
                <h3 className="brand-font mb-3 text-dark" style={{ fontSize: '1.6rem' }}>
                  {selectedTip.title}
                </h3>
                <div className="d-flex gap-3 small text-muted font-monospace mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
                  <span>By {selectedTip.authorName || 'Chef James Thew'}</span>
                  <span>&bull;</span>
                  <span>Published {new Date(selectedTip.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="lead mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-line', color: 'var(--dp-color-ink-1)' }}>
                  {selectedTip.content}
                </div>
                {selectedTip.videoUrl && (
                  <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <div className="font-monospace small fw-semibold mb-2">Masterclass Video Demonstration</div>
                    <a
                      href={selectedTip.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-dark font-monospace"
                      style={{ borderRadius: 0 }}
                    >
                      ▶ Open Video Demonstration
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer px-4 py-3 bg-white border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark font-monospace"
                  style={{ borderRadius: 0 }}
                  onClick={() => setSelectedTip(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
