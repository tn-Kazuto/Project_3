import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { recipeApi, feedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getVideoEmbed } from '../../utils/recipeVideo';

const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80';
const CULINARY_SVG_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="%23242320"/><rect x="30" y="30" width="740" height="390" stroke="%23c5a880" stroke-width="1.5" stroke-dasharray="6 4" fill="none"/><circle cx="400" cy="180" r="44" stroke="%23c5a880" stroke-width="2" fill="%231a1918"/><path d="M380 185C380 170 390 160 400 160C410 160 420 170 420 185H380Z" fill="%23c5a880"/><rect x="375" y="187" width="50" height="4" rx="2" fill="%23c5a880"/><circle cx="400" cy="154" r="4" fill="%23c5a880"/><text x="400" y="270" text-anchor="middle" fill="%23fcfbf7" font-family="serif" font-size="20" letter-spacing="3">CHEF JAMES THEW</text><text x="400" y="300" text-anchor="middle" fill="%23c5a880" font-family="monospace" font-size="12" letter-spacing="4">5-STAR CULINARY ATELIER</text></svg>`;

const toRoman = (num) => {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
  return map[num - 1] || num.toString();
};

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [preppedIngredients, setPreppedIngredients] = useState({});

  // Feedback form state
  const [comment, setComment] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRecipeData = async () => {
      try {
        setLoading(true);
        const resRecipe = await recipeApi.getById(id);
        if (!isMounted) return;
        if (resRecipe.data?.success) {
          setError('');
          setAccessDenied(false);
          setRecipe(resRecipe.data.data);
          // Load feedbacks non-blocking
          feedbackApi.getByRecipe(id).then((fbRes) => {
            if (isMounted && fbRes.data?.success) {
              setFeedbacks(fbRes.data.data);
            }
          }).catch(() => {});
        } else {
          setAccessDenied(false);
          setError(resRecipe.data?.message || 'Recipe not found');
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 403) {
          setAccessDenied(true);
          setError(err.response?.data?.message || 'This recipe is exclusive to registered members. Please subscribe or log in to view.');
        } else {
          setAccessDenied(false);
          setError('Failed to load recipe details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecipeData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError('');
      setAccessDenied(false);
      const res = await recipeApi.getById(id);
      if (res.data?.success) {
        setRecipe(res.data.data);
      } else {
        setError(res.data?.message || 'Recipe not found');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
        setError(err.response?.data?.message || 'This recipe is exclusive to registered members. Please subscribe or log in to view.');
      } else {
        setAccessDenied(false);
        setError('Failed to load recipe details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await feedbackApi.getByRecipe(id);
      if (res.data?.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!comment.trim()) {
      setFeedbackError('Please enter a comment.');
      return;
    }

    if (!isAuthenticated && (!senderName.trim() || !senderEmail.trim())) {
      setFeedbackError('Please provide your name and email to leave feedback.');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const payload = {
        recipeId: parseInt(id, 10),
        comment: comment.trim(),
        senderName: isAuthenticated ? undefined : senderName.trim(),
        senderEmail: isAuthenticated ? undefined : senderEmail.trim(),
      };
      if (rating) payload.rating = rating;
      if (mediaUrl.trim()) payload.mediaUrl = mediaUrl.trim();

      const res = await feedbackApi.create(payload);
      if (res.data?.success) {
        setFeedbackSuccess('Thank you! Your feedback has been posted.');
        setComment('');
        setMediaUrl('');
        setRating(null);
        if (!isAuthenticated) {
          setSenderName('');
          setSenderEmail('');
        }
        fetchFeedbacks(); // Reload feedbacks
      } else {
        setFeedbackError(res.data?.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Error submitting feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleShareFacebook = async () => {
    if (!recipe) return;
    const currentUrl = window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');

    try {
      const res = await recipeApi.share(recipe.recipeId, 'facebook');
      if (res.data?.success) {
        setRecipe((prev) => ({ ...prev, shareCount: res.data.data }));
      }
    } catch (err) {
      console.error('Failed to register share count:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!recipe) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);

      const res = await recipeApi.share(recipe.recipeId, 'link');
      if (res.data?.success) {
        setRecipe((prev) => ({ ...prev, shareCount: res.data.data }));
      }
    } catch (err) {
      console.error('Failed to copy link or increment share count:', err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 luxury-recipe-detail" role="status" aria-label="Loading culinary recipe">
        <div className="mb-4">
          <div className="culinary-skeleton-block mb-3" style={{ width: '220px', height: '1.25rem' }} />
          <div className="culinary-skeleton-block mb-3" style={{ width: '70%', height: '3rem' }} />
        </div>
        <div className="culinary-skeleton-block mb-5" style={{ aspectRatio: '21/9', width: '100%' }} />
        <div className="row g-5">
          <div className="col-lg-5">
            <div className="p-4 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <div className="culinary-skeleton-block mb-3" style={{ width: '50%', height: '1.5rem' }} />
              <div className="culinary-skeleton-block mb-2" style={{ width: '90%', height: '1rem' }} />
              <div className="culinary-skeleton-block mb-2" style={{ width: '80%', height: '1rem' }} />
              <div className="culinary-skeleton-block mb-2" style={{ width: '85%', height: '1rem' }} />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="p-4 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
              <div className="culinary-skeleton-block mb-3" style={{ width: '60%', height: '1.5rem' }} />
              <div className="culinary-skeleton-block mb-3" style={{ width: '100%', height: '1rem' }} />
              <div className="culinary-skeleton-block mb-3" style={{ width: '95%', height: '1rem' }} />
            </div>
          </div>
        </div>
        <span className="visually-hidden">Loading recipe details...</span>
      </div>
    );
  }

  if (error || !recipe) {
    const returnTo = { pathname: location.pathname, search: location.search, hash: location.hash };
    return (
      <div className="container py-5 text-center">
        <div
          className="d-inline-block p-5 text-center max-w-600 mx-auto"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            border: '1px solid var(--dp-color-accent)',
            borderRadius: 0,
          }}
        >
          <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)', fontSize: '1.1rem' }}>
            {accessDenied ? 'RESERVED ARCHIVE' : 'RECIPE UNAVAILABLE'}
          </div>
          <h3 className="brand-font mb-2 text-white" style={{ fontSize: '1.75rem' }}>
            {accessDenied ? 'Member Exclusive Content' : 'We could not load this recipe'}
          </h3>
          <p className="mb-4" style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.65' }}>
            {accessDenied ? 'Sign in or register to unlock the complete recipe.' : error || 'Please try again in a moment.'}
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {accessDenied ? (
              isAuthenticated ? (
                <Link to="/profile" className="btn btn-primary">Renew membership</Link>
              ) : (
                <>
                  <Link to="/register" state={{ from: returnTo }} className="btn btn-primary">Subscribe &amp; Unlock</Link>
                  <Link to="/login" state={{ from: returnTo }} className="btn btn-outline-light">Already a member? Sign in</Link>
                </>
              )
            ) : (
              <button type="button" onClick={fetchRecipe} className="btn btn-primary">Try again</button>
            )}
            <Link to="/recipes" className="btn btn-outline-light">Back to Recipes</Link>
          </div>
        </div>
      </div>
    );
  }

  // Split ingredients by newline or commas for structured display
  const ingredientList = String(recipe.ingredients || '')
    .split(/\r?\n|•/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  // Split steps by newline
  const stepList = String(recipe.cookingProcedure || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const isPreview = recipe.accessLevel === 'PREVIEW' || (!recipe.isFree && !isAuthenticated);
  const visibleStepCount = isPreview ? Math.max(1, Math.ceil(stepList.length * 0.5)) : stepList.length;
  const visibleSteps = stepList.slice(0, visibleStepCount);
  const returnTo = { pathname: location.pathname, search: location.search, hash: location.hash };

  return (
    <div className="container py-5 luxury-recipe-detail">
      {/* 5-Star Printable Dossier Watermark */}
      <div className="recipe-print-watermark d-none d-print-block mb-4 pb-3 border-bottom border-dark text-center">
        <div className="roman-numeral mb-1" style={{ fontSize: '0.85rem' }}>
          CHEF JAMES THEW &middot; 5-STAR CULINARY ATELIER
        </div>
        <div className="brand-font h3 mb-1">Official Culinary Dossier</div>
        <div className="small font-monospace text-uppercase text-muted">Archival Kitchen Edition</div>
      </div>

      {/* Back button & Print Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 print-hide">
        <Link
          to="/recipes"
          className="text-decoration-none small d-inline-flex align-items-center gap-2 gold-underline text-uppercase fw-semibold"
          style={{ letterSpacing: '0.14em', color: 'var(--dp-color-ink-2)' }}
        >
          <span>&larr; Back to Culinary Library</span>
        </Link>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Facebook Share Button */}
          <button
            type="button"
            onClick={handleShareFacebook}
            className="btn btn-sm d-inline-flex align-items-center gap-2 font-monospace text-uppercase"
            style={{
              backgroundColor: '#1877f2',
              color: '#ffffff',
              border: 'none',
              borderRadius: 0,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
            }}
            title="Share this recipe to Facebook"
          >
            <span>Share on Facebook</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 font-monospace text-uppercase"
            style={{
              borderColor: 'var(--dp-color-rule)',
              color: 'var(--dp-color-ink)',
              borderRadius: 0,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
            }}
            title="Copy recipe link to clipboard"
          >
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 font-monospace text-uppercase"
            style={{
              borderColor: 'var(--dp-color-rule)',
              color: 'var(--dp-color-ink)',
              borderRadius: 0,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
            }}
          >
            <span>Print Culinary Card</span>
          </button>
        </div>
      </div>

      {/* Recipe Header Card */}
      <div
        className="p-4 p-md-5 mb-5"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="badge bg-light text-dark border font-monospace">
              {recipe.categoryName}
            </span>
            <span
              className="badge font-monospace"
              style={{
                backgroundColor: recipe.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                color: '#ffffff',
                borderRadius: 0,
              }}
            >
              {recipe.isFree ? 'Free Access' : 'Members Only'}
            </span>
            {recipe.contentType === 'VIDEO' && (
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: 'var(--dp-color-accent)', color: '#ffffff', borderRadius: 0 }}>
                Video Masterclass
              </span>
            )}
            {recipe.contentType === 'TALKSHOW' && (
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#2c3e50', color: '#ffffff', borderRadius: 0 }}>
                Culinary Talkshow
              </span>
            )}
            {recipe.contentType === 'LIVESHOW' && (
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#c0392b', color: '#ffffff', borderRadius: 0 }}>
                Live Show
              </span>
            )}
          </div>
          <div className="small d-flex flex-wrap align-items-center gap-3 text-muted font-monospace">
            <span>
              By {recipe.authorName}
            </span>
            <span>
              {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
            <span>
              {recipe.shareCount || 0} Shares
            </span>
          </div>
        </div>

        <h1 className="brand-font display-6 mb-3 text-dark" style={{ letterSpacing: '-0.015em' }}>
          {recipe.title}
        </h1>

        {isPreview && (
          <div className="p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2" role="status" style={{ backgroundColor: 'var(--dp-color-ground-2)', borderLeft: '3px solid var(--dp-color-accent)' }}>
            <div>
              <strong className="d-block text-dark mb-1">50% Exclusive Recipe Preview</strong>
              <span className="small text-muted">You are viewing complimentary preview steps. Subscribe to Chef James Thew Atelier to unlock the entire methodology and video masterclass.</span>
            </div>
            <Link to="/register" state={{ from: returnTo }} className="btn btn-sm btn-primary font-monospace text-uppercase" style={{ letterSpacing: '0.08em', fontSize: '0.75rem' }}>
              Subscribe &amp; Unlock
            </Link>
          </div>
        )}

        {/* Quick Culinary Specs Bar */}
        <div className="d-flex flex-wrap align-items-center gap-3 py-2 px-3 mb-4 small" style={{ backgroundColor: 'var(--dp-color-ground-2)', border: '1px solid var(--dp-color-panel-line)' }}>
          <div>
            <span className="text-muted font-monospace me-1">CATEGORY:</span>
            <strong className="text-dark font-monospace">{recipe.categoryName}</strong>
          </div>
          <span className="text-muted opacity-50">&bull;</span>
          <div>
            <span className="text-muted font-monospace me-1">TIER:</span>
            <span className="badge font-monospace" style={{ backgroundColor: recipe.isFree ? '#1b4d3e' : 'var(--dp-color-field)', color: '#ffffff', borderRadius: 0 }}>
              {recipe.isFree ? 'Free Access' : 'Members Only'}
            </span>
          </div>
          <span className="text-muted opacity-50">&bull;</span>
          <div>
            <span className="text-muted font-monospace me-1">FORMAT:</span>
            <strong className="text-dark font-monospace">{recipe.contentType || 'ARTICLE'}</strong>
          </div>
          <span className="text-muted opacity-50">&bull;</span>
          <div>
            <span className="text-muted font-monospace me-1">AUTHOR:</span>
            <strong className="text-dark font-monospace">{recipe.authorName || 'Chef James Thew'}</strong>
          </div>
        </div>

        {/* Recipe Hero Image if not video */}
        {(!recipe.videoUrl || isPreview) && (
          <div className="mb-4 overflow-hidden" style={{ maxHeight: '440px', border: '1px solid var(--dp-color-panel-line)', backgroundColor: 'var(--dp-color-ground-2)' }}>
            <img
              src={recipe.imageUrl || FALLBACK_RECIPE_IMAGE}
              alt={recipe.title}
              className="w-100"
              style={{ objectFit: 'cover', maxHeight: '440px' }}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = CULINARY_SVG_PLACEHOLDER;
              }}
            />
          </div>
        )}

        {/* Video Masterclass / Screening Player (SRS v2.0) */}
        {!isPreview && recipe.videoUrl && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="roman-numeral" style={{ fontSize: '0.85rem' }}>
                {recipe.contentType === 'LIVESHOW'
                  ? 'LIVE STREAM ARCHIVE'
                  : recipe.contentType === 'TALKSHOW'
                  ? 'CULINARY TALKSHOW SCREENING'
                  : 'CHEF MASTERCLASS BROADCAST'}
              </div>
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: 'var(--dp-color-field)', color: 'var(--dp-color-accent)', borderRadius: 0 }}>
                {recipe.contentType || 'VIDEO'} FORMAT
              </span>
            </div>
            <div
              className="ratio ratio-16x9 shadow-sm"
              style={{
                border: '2px solid var(--dp-color-accent)',
                backgroundColor: 'var(--dp-color-field)',
              }}
            >
              {(() => {
                const embed = getVideoEmbed(recipe.videoUrl);
                if (!embed) {
                  return <p className="m-0 p-3 text-white" role="alert">This video link is unavailable. Please contact the recipe author.</p>;
                }
                if (embed?.type === 'video') {
                  return (
                    <video controls playsInline preload="metadata" poster={recipe.thumbnailUrl || recipe.imageUrl} className="w-100 h-100">
                      <source src={embed.src} type={embed.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  );
                }
                return (
                  <iframe
                    src={embed?.src}
                    title={recipe.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                );
              })()}
            </div>
          </div>
        )}

        {/* VIP Locked Masterclass Broadcast Banner (for Guest Preview) */}
        {isPreview && (recipe.contentType === 'VIDEO' || recipe.contentType === 'TALKSHOW' || recipe.contentType === 'LIVESHOW' || recipe.videoUrl) && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="roman-numeral" style={{ fontSize: '0.85rem' }}>
                CHEF JAMES THEW · MASTERCLASS BROADCAST [VIP STREAM]
              </div>
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: 'var(--dp-color-accent)', color: '#ffffff', borderRadius: 0 }}>
                LOCKED STREAM
              </span>
            </div>
            <div
              className="p-4 p-md-5 text-center d-flex flex-column align-items-center justify-content-center"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                border: '2px solid var(--dp-color-accent)',
                color: 'var(--dp-color-on-field)',
                minHeight: '220px',
              }}
            >
              <div className="mb-2" style={{ fontSize: '2rem' }}>🔒</div>
              <h3 className="brand-font h4 text-white mb-2">Video Masterclass Độc Quyền Hội Viên VIP</h3>
              <p className="small max-w-600 mb-3" style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.65' }}>
                Video chất lượng cao hướng dẫn kỹ thuật nấu ăn trực tiếp từ Chef James Thew dành riêng cho thành viên VIP. Đăng ký ngay để mở khóa toàn bộ video và công thức.
              </p>
              <Link
                to="/register"
                state={{ from: returnTo }}
                className="btn btn-primary text-uppercase font-monospace btn-sm"
                style={{ letterSpacing: '0.12em', padding: '0.6rem 1.5rem' }}
              >
                Mở Khóa Video ($10/tháng)
              </Link>
            </div>
          </div>
        )}

        <div className="row g-4 mt-2">
          {/* Ingredients Section (Pale Taupe Field & Ruled Rows) */}
          <div className="col-lg-5">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="roman-numeral mb-1" style={{ fontSize: '0.9rem' }}>COMPONENT LIST</div>
              <h2 className="brand-font h4 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                Ingredients
              </h2>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  MISE EN PLACE (CLICK TO CHECK OFF)
                </span>
                {Object.values(preppedIngredients).some(Boolean) && (
                  <button
                    type="button"
                    onClick={() => setPreppedIngredients({})}
                    className="btn btn-link btn-sm p-0 text-decoration-none font-monospace"
                    style={{ fontSize: '0.7rem', color: 'var(--dp-color-ink-2)' }}
                  >
                    [Reset]
                  </button>
                )}
              </div>
              <ul className="list-unstyled d-flex flex-column gap-0 mb-0">
                {ingredientList.map((item, idx) => {
                  const isPrepped = Boolean(preppedIngredients[idx]);
                  return (
                    <li
                      key={idx}
                      onClick={() => setPreppedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      role="checkbox"
                      aria-checked={isPrepped}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setPreppedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
                        }
                      }}
                      className={`mise-en-place-item d-flex align-items-start gap-2 py-2 ${isPrepped ? 'is-prepped' : ''}`}
                      style={{
                        borderBottom: '1px solid var(--dp-color-panel-line)',
                        color: 'var(--dp-color-ink)',
                        fontSize: '0.92rem',
                      }}
                    >
                      <span className="font-monospace mt-1" style={{ color: isPrepped ? 'var(--dp-color-accent)' : 'var(--dp-color-ink-2)' }}>
                        {isPrepped ? '✓' : '•'}
                      </span>
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>

              {/* Sommelier & Cellar Recommendation */}
              <div className="sommelier-note-card mt-4">
                <div className="small font-monospace text-uppercase fw-bold mb-1" style={{ color: 'var(--dp-color-accent-text)', fontSize: '0.72rem', letterSpacing: '0.12em' }}>
                  🍷 Cellar &amp; Pairing Recommendation
                </div>
                <p className="small mb-0" style={{ color: 'var(--dp-color-ink)', lineHeight: '1.55', fontStyle: 'italic' }}>
                  {recipe.categoryName === 'Italian'
                    ? 'Pairs sublimely with an aged Barolo or crisp Pinot Grigio from Friuli. Serve at 16°C.'
                    : recipe.categoryName === 'Vegetarian'
                    ? 'Best accompanied by an aromatic Sauvignon Blanc or chilled restorative herbal infusion.'
                    : recipe.categoryName === 'Juices'
                    ? 'Enjoy fresh within 20 minutes of cold-press extraction to preserve active botanical enzymes.'
                    : 'Pairs exceptionally with a full-bodied Cabernet Sauvignon or Tuscan Chianti Classico.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cooking Procedure Section with Roman Numerals */}
          <div className="col-lg-7">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-rule)',
              }}
            >
              <div className="roman-numeral mb-1" style={{ fontSize: '0.9rem' }}>METHODOLOGY</div>
              <h2 className="brand-font h4 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
                Cooking Procedure {isPreview && <span className="small text-muted font-monospace fw-normal">(50% Preview)</span>}
              </h2>
              <div className="d-flex flex-column gap-3">
                {visibleSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="d-flex gap-3 py-2"
                    style={{
                      borderBottom: (idx !== visibleSteps.length - 1 || isPreview) ? '1px solid var(--dp-color-rule)' : 'none',
                    }}
                  >
                    <span
                      className="roman-numeral flex-shrink-0 pt-1"
                      style={{
                        minWidth: '2.5rem',
                        fontSize: '1.1rem',
                        color: 'var(--dp-color-accent)',
                      }}
                    >
                      {toRoman(idx + 1)}.
                    </span>
                    <p className="m-0 small pt-1" style={{ color: 'var(--dp-color-ink)', lineHeight: '1.75' }}>
                      {step}
                    </p>
                  </div>
                ))}

                {isPreview && (
                  <div
                    className="d-flex gap-3 py-2 position-relative"
                    style={{
                      filter: 'blur(3.5px)',
                      opacity: 0.35,
                      userSelect: 'none',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    }}
                    aria-hidden="true"
                  >
                    <span
                      className="roman-numeral flex-shrink-0 pt-1"
                      style={{
                        minWidth: '2.5rem',
                        fontSize: '1.1rem',
                        color: 'var(--dp-color-accent)',
                      }}
                    >
                      {toRoman(visibleSteps.length + 1)}.
                    </span>
                    <p className="m-0 small pt-1" style={{ color: 'var(--dp-color-ink)', lineHeight: '1.75' }}>
                      {stepList.length > visibleStepCount
                        ? stepList[visibleStepCount]
                        : 'Tinh chỉnh nhiệt độ lửa, hòa quyện nước xốt nhũ tương hóa và hoàn thiện nghệ thuật decor món ăn theo chuẩn 5 sao...'}
                    </p>
                  </div>
                )}
              </div>
              {isPreview && (
                <div
                  className="mt-4 p-4 text-center"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    border: '1px solid var(--dp-color-accent)',
                  }}
                >
                  <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)', fontSize: '0.85rem' }}>
                    50% COMPLIMENTARY PREVIEW REACHED
                  </div>
                  <h3 className="brand-font h3 text-white mb-2">
                    Khám Phá Trọn Vẹn Công Thức &amp; Video Masterclass
                  </h3>
                  <p className="small mb-4 max-w-600 mx-auto" style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.65' }}>
                    Bạn đang xem 50% bản xem trước miễn phí. Hãy đăng ký tài khoản Hội viên VIP ($10/tháng) để mở khóa toàn bộ các bước thực hiện chi tiết, bí quyết định lượng từ Bếp trưởng James Thew và toàn bộ video Masterclass độ nét cao.
                  </p>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    {isAuthenticated ? (
                      <Link to="/profile" className="btn btn-primary text-uppercase font-monospace px-4 py-2" style={{ letterSpacing: '0.1em' }}>
                        Gia Hạn Gói Thành Viên
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/register"
                          state={{ from: returnTo }}
                          className="btn btn-primary text-uppercase font-monospace px-4 py-2"
                          style={{ letterSpacing: '0.1em', fontWeight: 600 }}
                        >
                          Đăng Ký Thành Viên VIP ($10/tháng)
                        </Link>
                        <Link
                          to="/login"
                          state={{ from: returnTo }}
                          className="btn btn-outline-light text-uppercase font-monospace px-4 py-2"
                          style={{ letterSpacing: '0.1em' }}
                        >
                          Đã Có Tài Khoản? Đăng Nhập
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div
        className="p-4 p-md-5 mb-4"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--dp-color-rule)',
        }}
      >
        <div className="roman-numeral mb-1">CRITIQUE & INQUIRIES</div>
        <h3 className="brand-font mb-4 text-dark d-flex align-items-center gap-2">
          Recipe Feedback & Reviews ({feedbacks.length})
        </h3>

        {/* Feedback submission form */}
        <div
          className="p-4 mb-4"
          style={{
            backgroundColor: 'var(--dp-color-ground-2)',
            border: '1px solid var(--dp-color-panel-line)',
          }}
        >
          <h5 className="brand-font mb-1 text-dark">Leave your feedback</h5>
          <p className="small text-muted mb-3">
            Did you try this recipe? Let Chef James and the community know your thoughts!
          </p>

          {feedbackSuccess && (
            <div className="alert alert-success small py-2 mb-3" style={{ borderRadius: 0 }}>
              {feedbackSuccess}
            </div>
          )}
          {feedbackError && (
            <div className="alert alert-danger small py-2 mb-3" style={{ borderRadius: 0 }}>
              {feedbackError}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit}>
            {!isAuthenticated && (
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name *"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your Email *"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Interactive Star Rating (SRS v2.0) */}
            <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
              <span className="small font-monospace text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
                Culinary Rating *:
              </span>
              <div className="d-flex align-items-center gap-1" role="radiogroup" aria-label="Culinary Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn p-0 border-0 bg-transparent font-monospace"
                    style={{
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      color: (hoverRating || rating) >= star ? '#b69355' : '#8c8c8c',
                    }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="small text-muted font-monospace ms-1" style={{ fontSize: '0.8rem' }}>
                {rating ? `(${rating} / 5 ${rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : 'Average'})` : '(Optional Rating)'}
              </span>
            </div>

            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write your review or questions..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Practiced Dish Media Attachment (SRS v2.0) */}
            <div className="mb-3">
              <label className="form-label small text-muted font-monospace text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                Attach Practiced Dish Photo / Video URL (Optional)
              </label>
              <input
                id="practicedDishMediaUrl"
                type="url"
                className="form-control form-control-sm"
                style={{ borderColor: 'var(--dp-color-panel-line)', borderRadius: 0 }}
                placeholder="Attach Practiced Dish Photo / Video URL (https://...)"
                aria-label="Attach Practiced Dish Photo / Video URL"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              {mediaUrl && (
                <div className="mt-2 p-2 bg-white border d-inline-block" style={{ maxWidth: '200px' }}>
                  <span className="small font-monospace text-muted d-block mb-1" style={{ fontSize: '0.7rem' }}>Preview Attachment:</span>
                  <img
                    src={mediaUrl}
                    alt="User Dish Preview"
                    className="img-fluid"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ maxHeight: '120px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="btn btn-primary btn-sm px-4 fw-semibold d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
            >
              {submittingFeedback ? 'Submitting...' : 'Post Feedback'}
            </button>
          </form>
        </div>

        {/* Average Rating Summary & Community Creations Gallery */}
        {feedbacks.length > 0 && (() => {
          const ratings = feedbacks.filter((f) => f.rating > 0).map((f) => f.rating);
          const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
          return (
            <div
              className="p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="brand-font display-6 fw-bold text-dark m-0">{avg || '5.0'}</div>
                <div>
                  <div className="d-flex align-items-center gap-1 font-monospace" style={{ color: '#b69355' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ opacity: s <= Math.round(Number(avg || 5)) ? 1 : 0.3 }}>★</span>
                    ))}
                  </div>
                  <div className="small font-monospace text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                    Based on {feedbacks.length} critique{feedbacks.length > 1 ? 's' : ''} & creations
                  </div>
                </div>
              </div>
              <span className="badge font-monospace text-uppercase px-3 py-2" style={{ backgroundColor: 'var(--dp-color-field)', color: 'var(--dp-color-accent)', borderRadius: 0 }}>
                Verified Community Atelier
              </span>
            </div>
          );
        })()}

        {/* Existing Feedbacks List */}
        <div className="d-flex flex-column gap-3">
          {feedbacks.length > 0 ? (
            feedbacks.map((f) => (
              <div
                key={f.feedbackId}
                className="p-3"
                style={{
                  backgroundColor: 'var(--dp-color-ground)',
                  border: '1px solid var(--dp-color-rule)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-dark small">{f.senderName}</span>
                    {f.rating > 0 && (
                      <div className="d-flex align-items-center gap-1 font-monospace small" style={{ color: '#b69355' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} style={{ opacity: s <= f.rating ? 1 : 0.3 }}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                    {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="small m-0" style={{ color: 'var(--dp-color-ink-2)', lineHeight: '1.6' }}>{f.comment}</p>
                {f.mediaUrl && (
                  <div className="mt-3 pt-2 border-top" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                    <div className="small font-monospace text-uppercase text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                      Practiced Dish Creation:
                    </div>
                    <div style={{ maxWidth: '280px', border: '1px solid var(--dp-color-accent)', backgroundColor: '#000' }}>
                      <img
                        src={f.mediaUrl}
                        alt={`Creation by ${f.senderName}`}
                        className="img-fluid"
                        style={{ maxHeight: '180px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted small text-center py-3">
              No feedback left yet. Be the first to review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
