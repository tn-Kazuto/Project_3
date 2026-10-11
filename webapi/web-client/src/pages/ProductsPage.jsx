import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, X, RotateCcw } from 'lucide-react';
import { FilterSidebar } from '../components/layout/Sidebar';
import { ProductCard } from '../components/common/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import './ProductsPage.css';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || '';
  const tagParam = searchParams.get('tag') || '';

  // Filter States
  const [userCategories, setUserCategories] = useState(null);
  const selectedCategories = useMemo(() => {
    if (userCategories !== null) return userCategories;
    return catParam ? [catParam] : [];
  }, [userCategories, catParam]);

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleCategoryToggle = (slug) => {
    const current = selectedCategories;
    const next = current.includes(slug) ? current.filter(c => c !== slug) : [...current, slug];
    setUserCategories(next);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setUserCategories([]);
    setSelectedBrands([]);
    setPriceRange('all');
    setMinRating(0);
    setInStockOnly(false);
    setSearchParams({});
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(item => {
      // Search query
      if (queryParam && !item.name.toLowerCase().includes(queryParam.toLowerCase())) {
        return false;
      }
      // Tag (e.g. sale)
      if (tagParam === 'sale' && item.discountPercent <= 10) {
        return false;
      }
      // Categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
        return false;
      }
      // Brands
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) {
        return false;
      }
      // Rating
      if (minRating > 0 && item.rating < minRating) {
        return false;
      }
      // In stock
      if (inStockOnly && !item.inStock) {
        return false;
      }
      // Price range
      if (priceRange === 'under-5' && item.price >= 5000000) return false;
      if (priceRange === '5-15' && (item.price < 5000000 || item.price > 15000000)) return false;
      if (priceRange === '15-30' && (item.price < 15000000 || item.price > 30000000)) return false;
      if (priceRange === 'over-30' && item.price <= 30000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount; // 'popular'
    });
  }, [queryParam, tagParam, selectedCategories, selectedBrands, minRating, inStockOnly, priceRange, sortBy]);

  return (
    <div className="products-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <div className="breadcrumb-list">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-active">Cửa hàng & Danh mục</span>
            {queryParam && (
              <>
                <ChevronRight size={14} className="breadcrumb-separator" />
                <span>Tìm kiếm: "{queryParam}"</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="products-layout-grid">
          {/* Left Column: Filter Sidebar */}
          <div className={`filter-sidebar-wrapper ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
            <FilterSidebar
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryToggle}
              selectedBrands={selectedBrands}
              onBrandChange={handleBrandToggle}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              minRating={minRating}
              onRatingChange={setMinRating}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Column: Catalog Content */}
          <div className="products-content-area">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-info">
                <button
                  type="button"
                  className="btn btn-outline btn-sm mobile-filter-btn"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <SlidersHorizontal size={16} />
                  <span>Bộ lọc</span>
                </button>
                <div className="result-count">
                  Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm công nghệ
                </div>
              </div>

              <div className="toolbar-controls">
                <div className="sort-group">
                  <span>Sắp xếp theo:</span>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Nổi bật nhất</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="rating">Đánh giá tốt nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange !== 'all') && (
              <div className="active-filters-bar">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đang lọc:</span>
                {selectedCategories.map(cat => (
                  <span key={cat} className="filter-tag">
                    {cat}
                    <X size={12} className="filter-tag-remove" onClick={() => handleCategoryToggle(cat)} />
                  </span>
                ))}
                {selectedBrands.map(b => (
                  <span key={b} className="filter-tag">
                    {b}
                    <X size={12} className="filter-tag-remove" onClick={() => handleBrandToggle(b)} />
                  </span>
                ))}
                {priceRange !== 'all' && (
                  <span className="filter-tag">
                    Mức giá: {priceRange}
                    <X size={12} className="filter-tag-remove" onClick={() => setPriceRange('all')} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer', background: 'none' }}
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="no-products-found">
                <h3 style={{ marginBottom: 8, color: 'var(--text-main)' }}>Không tìm thấy sản phẩm phù hợp</h3>
                <p style={{ marginBottom: 20 }}>Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleResetFilters}>
                  <RotateCcw size={16} />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            ) : (
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
