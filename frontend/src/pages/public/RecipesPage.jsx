import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi, tipApi, categoryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const RecipesPage = () => {
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'tips'
  const [recipes, setRecipes] = useState([]);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // 'all', 'free', 'members'
  const [formatFilter, setFormatFilter] = useState('ALL'); // 'ALL', 'ARTICLE', 'VIDEO', 'TALKSHOW', 'LIVESHOW'
  const [loading, setLoading] = useState(true);

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

  // Fetch recipes or tips based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.categoryId = selectedCategory;
        if (tierFilter === 'free') params.isFreeOnly = true;
        else if (tierFilter === 'members') params.isFreeOnly = false;
        if (formatFilter !== 'ALL') params.contentType = formatFilter;

        if (activeTab === 'recipes') {
          if (searchTerm.trim()) params.search = searchTerm.trim();
          const res = await recipeApi.getAll(params);
          if (res.data?.success) {
            let data = res.data.data || [];
            if (formatFilter !== 'ALL') {
              data = data.filter((r) => (r.contentType || 'ARTICLE').toUpperCase() === formatFilter.toUpperCase());
            }
            setRecipes(data);
          }
        } else {
          if (searchTerm.trim()) params.search = searchTerm.trim();
          const res = await tipApi.getAll(params);
          if (res.data?.success) setTips(res.data.data || []);
        }
      } catch (err) {
        console.error('Error loading recipes/tips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedCategory, searchTerm, tierFilter, formatFilter]);

  const handleCardClick = (item, isRecipe = true) => {
    if (!item.isFree && !isAuthenticated) {
      navigate('/register', {
        state: { message: 'This culinary secret is exclusive to registered members. Please subscribe to unlock!' },
      });
      return;
    }
    if (isRecipe) {
      navigate(`/recipes/${item.recipeId}`);
    }
  };

  return (
    <div className="container py-5 luxury-recipes">
      {/* Architectural Section Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div>
          <div className="roman-numeral mb-1">III &middot; ARCHITECTURAL CATALOG</div>
          <h1 className="brand-font display-5 mb-0 text-dark">Culinary Library</h1>
          <p className="text-muted small mt-2 mb-0">
            Exclusive gastronomy formulated by Executive Chef James Thew across Juices, Vegetarian, Non-Vegetarian, and Italian classics.
          </p>
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

      {/* Search & Category Filter Bar */}
      <div
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
        <div className="d-flex justify-content-center align-items-center py-5 min-vh-25">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : activeTab === 'recipes' ? (
        /* Recipes Grid */
        <div className="row g-4">
          {recipes.length > 0 ? (
            recipes.map((r) => (
              <div key={r.recipeId} className="col-md-6 col-lg-4">
                <div
                  className="card h-100 p-4 cursor-pointer"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--dp-color-rule)',
                    borderRadius: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCardClick(r, true)}
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
                  </div>

                  <h4 className="brand-font mb-2 text-dark" style={{ fontSize: '1.35rem' }}>
                    {r.title}
                  </h4>

                  <p className="text-muted small line-clamp-3 mb-4 flex-grow-1" style={{ lineHeight: '1.65' }}>
                    <strong className="text-dark">Ingredients:</strong> {r.ingredients.substring(0, 100)}...
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
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              No recipes match your criteria. Try adjusting your search term or category.
            </div>
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
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--dp-color-rule)',
                    borderRadius: 0,
                  }}
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
                  <p className="text-muted small mb-4" style={{ lineHeight: '1.7' }}>
                    {t.content}
                  </p>

                  <div
                    className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center small text-muted font-monospace"
                    style={{ borderColor: 'var(--dp-color-rule)', fontSize: '0.75rem' }}
                  >
                    <span>By {t.authorName}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              No tips found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
