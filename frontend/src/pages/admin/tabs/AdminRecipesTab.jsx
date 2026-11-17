import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CULINARY_SVG_PLACEHOLDER } from '../../public/home/homeData';

export const AdminRecipesTab = ({
  recipes = [],
  categories = [],
  listError,
  onOpenRecipeModal,
  onToggleRecipeFree,
  onDeleteRecipe,
  renderManagementTableState,
  renderManagementPagination,
  onReload,
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setSearch('');
    setSelectedCategory('');
    setSelectedTier('');
    setSelectedFormat('');
  };

  const hasActiveFilters = Boolean(search || selectedCategory || selectedTier || selectedFormat);

  // Filter recipes client-side on current page
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = r.title?.toLowerCase().includes(query);
        const authorMatch = r.authorName?.toLowerCase().includes(query);
        if (!titleMatch && !authorMatch) return false;
      }

      if (selectedCategory) {
        const matchesCat = String(r.categoryId) === String(selectedCategory) ||
          r.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCat) return false;
      }

      if (selectedTier) {
        if (selectedTier === 'FREE' && !r.isFree) return false;
        if (selectedTier === 'MEMBERS' && r.isFree) return false;
      }

      if (selectedFormat) {
        const isVideo = r.contentType === 'VIDEO' || Boolean(r.videoUrl);
        if (selectedFormat === 'VIDEO' && !isVideo) return false;
        if (selectedFormat === 'ARTICLE' && isVideo) return false;
      }

      return true;
    });
  }, [recipes, search, selectedCategory, selectedTier, selectedFormat]);

  return (
    <div className="card shadow-sm border-0" style={{ backgroundColor: '#ffffff', borderRadius: 0 }}>
      {/* ── CARD HEADER & ACTION ── */}
      <div className="card-header bg-white py-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div className="d-flex align-items-center gap-2">
          <h2 className="brand-font h4 mb-0 text-dark">Recipes Catalog Management</h2>
          <span className="badge font-monospace bg-light text-dark border">
            {recipes.length} Recipes
          </span>
        </div>
        <button
          className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-2"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            letterSpacing: '0.12em',
            borderRadius: 0,
          }}
          onClick={onOpenRecipeModal}
        >
          <span>+ Add Recipe</span>
        </button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS TOOLBAR ── */}
      <div className="p-3 px-4 border-bottom" style={{ backgroundColor: 'var(--dp-color-ground-2)', borderColor: 'var(--dp-color-rule)' }}>
        <form className="row g-2 align-items-end" onSubmit={handleSearchSubmit}>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-uppercase font-monospace mb-1" htmlFor="recipe-catalog-search" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Search Dishes
            </label>
            <div className="input-group input-group-sm">
              <input
                id="recipe-catalog-search"
                type="search"
                className="form-control"
                placeholder="Search by title or chef author..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
              />
              <button
                type="submit"
                className="btn btn-outline-secondary"
                style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
              >
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold text-uppercase font-monospace mb-1" htmlFor="recipe-category-filter" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Category
            </label>
            <select
              id="recipe-category-filter"
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryName}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-uppercase font-monospace mb-1" htmlFor="recipe-tier-filter" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Access Tier
            </label>
            <select
              id="recipe-tier-filter"
              className="form-select form-select-sm"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Tiers</option>
              <option value="FREE">Free Access</option>
              <option value="MEMBERS">Members Only</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-uppercase font-monospace mb-1" htmlFor="recipe-format-filter" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Format
            </label>
            <select
              id="recipe-format-filter"
              className="form-select form-select-sm"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
            >
              <option value="">All Formats</option>
              <option value="ARTICLE">Article Only</option>
              <option value="VIDEO">Video Masterclass</option>
            </select>
          </div>

          <div className="col-6 col-md-1 d-flex align-items-end">
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-muted p-0 pb-1"
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem' }}
                title="Clear all active filters"
              >
                &times; Reset
              </button>
            )}
          </div>
        </form>

        {hasActiveFilters && (
          <div className="mt-2 small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
            Showing {filteredRecipes.length} of {recipes.length} recipes matching filter criteria.
          </div>
        )}
      </div>

      {/* ── RECIPES TABLE ── */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: '38%' }}>Title</th>
              <th scope="col">Category</th>
              <th scope="col">Format</th>
              <th scope="col">Author</th>
              <th scope="col">Access Tier</th>
              <th scope="col">Date</th>
              <th scope="col" className="text-end" style={{ minWidth: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderManagementTableState(recipes, 7, 'No recipes are available yet.', onReload)}
            {!listError && filteredRecipes.length === 0 && recipes.length > 0 && (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  <div className="roman-numeral mb-2" style={{ fontSize: '0.85rem' }}>ZERO MATCHES</div>
                  <p className="mb-2">No recipes match the active filter criteria.</p>
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleResetFilters} style={{ borderRadius: 0 }}>
                    Clear Filters
                  </button>
                </td>
              </tr>
            )}
            {!listError && filteredRecipes.map((r) => {
              const isVideo = r.contentType === 'VIDEO' || Boolean(r.videoUrl);
              return (
                <tr key={r.recipeId}>
                  {/* DISH THUMBNAIL + TITLE */}
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="overflow-hidden flex-shrink-0"
                        style={{
                          width: '52px',
                          height: '52px',
                          backgroundColor: 'var(--dp-color-ground-2)',
                          border: '1px solid var(--dp-color-rule)',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={r.imageUrl || CULINARY_SVG_PLACEHOLDER}
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
                        {isVideo && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'var(--dp-color-accent)',
                              fontSize: '0.65rem',
                              padding: '1px 3px',
                              lineHeight: 1,
                            }}
                            title="Video Masterclass"
                          >
                            &#9658;
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <Link
                          to={`/recipes/${r.recipeId}`}
                          className="fw-bold text-dark text-decoration-none d-block line-clamp-1 gold-underline-hover"
                          style={{ fontSize: '0.95rem' }}
                          title={`Preview: ${r.title}`}
                        >
                          {r.title}
                        </Link>
                        {r.ingredients && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '320px', fontSize: '0.78rem' }}>
                            {r.ingredients.substring(0, 75)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td>
                    <span className="badge bg-light text-dark border font-monospace" style={{ borderRadius: 0 }}>
                      {r.categoryName || 'Culinary'}
                    </span>
                  </td>

                  {/* FORMAT */}
                  <td>
                    <div className="d-flex flex-column align-items-start gap-1">
                      <span
                        className="badge font-monospace text-uppercase"
                        style={{
                          backgroundColor: isVideo ? 'var(--dp-color-field)' : '#4a5568',
                          color: '#ffffff',
                          borderRadius: 0,
                          fontSize: '0.7rem',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {isVideo ? 'VIDEO' : (r.contentType || 'ARTICLE')}
                      </span>
                      {r.shareCount > 0 && (
                        <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                          {r.shareCount} shares
                        </span>
                      )}
                    </div>
                  </td>

                  {/* AUTHOR */}
                  <td className="small" style={{ color: 'var(--dp-color-ink-2)' }}>
                    {r.authorName}
                  </td>

                  {/* ACCESS TIER */}
                  <td>
                    <span
                      className="badge font-monospace"
                      style={{
                        backgroundColor: r.isFree ? '#1b4d3e' : '#8a6d3b',
                        color: '#ffffff',
                        borderRadius: 0,
                        fontSize: '0.72rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {r.isFree ? 'FREE ACCESS' : 'MEMBERS ONLY'}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="small text-muted font-monospace">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS GROUP */}
                  <td className="text-end">
                    <div className="d-flex align-items-center justify-content-end gap-2 text-nowrap">
                      <Link
                        to={`/recipes/${r.recipeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-secondary"
                        style={{ borderRadius: 0, fontSize: '0.75rem', letterSpacing: '0.06em' }}
                        title="Open public preview in new tab"
                      >
                        View
                      </Link>
                      <button
                        className={`btn btn-sm text-nowrap ${r.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        title={r.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                        onClick={() => onToggleRecipeFree(r)}
                        style={{ minWidth: '115px' }}
                      >
                        {r.isFree ? 'Set Member-only' : 'Set Free'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger text-nowrap"
                        title="Delete Recipe"
                        onClick={() => onDeleteRecipe(r.recipeId, r.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderManagementPagination('recipes', 'Recipes')}
    </div>
  );
};
