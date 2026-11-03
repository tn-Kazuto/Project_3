import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeApi, feedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Calendar, Lock, CheckCircle2, MessageSquare, Send, ArrowLeft, Printer, Share2, Copy, Check, Video, Mic, Radio, FileText, Star, Camera } from 'lucide-react';

const FacebookIcon = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const toRoman = (num) => {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
  return map[num - 1] || num.toString();
};

const getVideoEmbed = (url) => {
  if (!url) return null;
  // YouTube watch format or short url
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[3]}` };
  }
  // Direct mp4 / webm
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: 'video', src: url };
  }
  return { type: 'iframe', src: url };
};

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

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

  const fetchRecipe = async () => {
    try {
      const res = await recipeApi.getById(id);
      if (res.data?.success) {
        setRecipe(res.data.data);
      } else {
        setError(res.data?.message || 'Recipe not found');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This recipe is exclusive to registered members. Please subscribe or log in to view.');
      } else {
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

  useEffect(() => {
    fetchRecipe();
    fetchFeedbacks();
  }, [id]);

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
      const res = await recipeApi.share(recipe.recipeId);
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

      const res = await recipeApi.share(recipe.recipeId);
      if (res.data?.success) {
        setRecipe((prev) => ({ ...prev, shareCount: res.data.data }));
      }
    } catch (err) {
      console.error('Failed to copy link or increment share count:', err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: 'var(--dp-color-accent)' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
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
          <Lock size={36} className="luxury-gold-icon mb-3" />
          <div className="roman-numeral mb-2" style={{ color: 'var(--dp-color-accent)' }}>
            RESERVED ARCHIVE
          </div>
          <h3 className="brand-font mb-2 text-white" style={{ fontSize: '1.75rem' }}>
            Member Exclusive Content
          </h3>
          <p className="mb-4" style={{ color: 'var(--dp-color-on-field-2)', lineHeight: '1.65' }}>
            {error}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link
              to="/register"
              className="btn btn-warning text-white fw-bold px-4 py-2"
              style={{
                backgroundColor: 'var(--dp-color-accent)',
                borderColor: 'var(--dp-color-accent)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
            >
              Subscribe & Unlock
            </Link>
            <Link
              to="/recipes"
              className="btn btn-outline-light px-4 py-2"
              style={{
                borderColor: 'var(--dp-color-field-line)',
                letterSpacing: '0.14em',
                borderRadius: 0,
              }}
            >
              Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Split ingredients by newline or commas for structured display
  const ingredientList = recipe.ingredients
    .split(/\r?\n|•/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  // Split steps by newline
  const stepList = recipe.cookingProcedure
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

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
          <ArrowLeft size={16} />
          Back to Culinary Library
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
            <FacebookIcon size={14} />
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
            {copiedLink ? <Check size={14} className="text-success" /> : <Copy size={14} className="luxury-gold-icon" />}
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
            <Printer size={15} className="luxury-gold-icon" />
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
                <Video size={11} className="me-1 inline" /> Video Masterclass
              </span>
            )}
            {recipe.contentType === 'TALKSHOW' && (
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#2c3e50', color: '#ffffff', borderRadius: 0 }}>
                <Mic size={11} className="me-1 inline" /> Culinary Talkshow
              </span>
            )}
            {recipe.contentType === 'LIVESHOW' && (
              <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#c0392b', color: '#ffffff', borderRadius: 0 }}>
                <Radio size={11} className="me-1 inline" /> Live Show
              </span>
            )}
          </div>
          <div className="small d-flex flex-wrap align-items-center gap-3 text-muted font-monospace">
            <span className="d-flex align-items-center gap-1">
              <ChefHat size={16} className="luxury-gold-icon" />
              By {recipe.authorName}
            </span>
            <span className="d-flex align-items-center gap-1">
              <Calendar size={16} />
              {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
            <span className="d-flex align-items-center gap-1">
              <Share2 size={15} className="luxury-gold-icon" />
              {recipe.shareCount || 0} Shares
            </span>
          </div>
        </div>

        <h1 className="brand-font display-6 mb-4 text-dark" style={{ letterSpacing: '-0.015em' }}>
          {recipe.title}
        </h1>

        {/* Video Masterclass / Screening Player (SRS v2.0) */}
        {recipe.videoUrl && (
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
                if (embed?.type === 'video') {
                  return (
                    <video controls poster={recipe.thumbnailUrl || recipe.imageUrl} className="w-100 h-100">
                      <source src={embed.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  );
                }
                return (
                  <iframe
                    src={embed?.src}
                    title={recipe.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                );
              })()}
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
              <ul className="list-unstyled d-flex flex-column gap-0 mb-0">
                {ingredientList.map((item, idx) => (
                  <li
                    key={idx}
                    className="d-flex align-items-start gap-2 py-2"
                    style={{
                      borderBottom: '1px solid var(--dp-color-panel-line)',
                      color: 'var(--dp-color-ink)',
                      fontSize: '0.92rem',
                    }}
                  >
                    <CheckCircle2 size={16} className="luxury-gold-icon flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
                Cooking Procedure
              </h2>
              <div className="d-flex flex-column gap-3">
                {stepList.map((step, idx) => (
                  <div
                    key={idx}
                    className="d-flex gap-3 py-2"
                    style={{
                      borderBottom: idx !== stepList.length - 1 ? '1px solid var(--dp-color-rule)' : 'none',
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
              </div>
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
          <MessageSquare size={22} className="luxury-gold-icon" />
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
                    className="btn p-0 border-0 bg-transparent"
                    style={{ cursor: 'pointer', lineHeight: 1 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={18}
                      fill={(hoverRating || rating) >= star ? '#b69355' : 'none'}
                      stroke={(hoverRating || rating) >= star ? '#b69355' : '#8c8c8c'}
                    />
                  </button>
                ))}
              </div>
              <span className="small text-muted font-monospace ms-1" style={{ fontSize: '0.8rem' }}>
                {rating ? `(${rating} / 5 ${rating === 5 ? '★ Exceptional' : rating === 4 ? '★ Very Good' : rating === 3 ? '★ Good' : '★ Average'})` : '(Optional Rating)'}
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
                <Camera size={13} className="me-1 inline luxury-gold-icon" />
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
              {submittingFeedback ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={14} />
                  <span>Post Feedback</span>
                </>
              )}
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
                  <div className="d-flex align-items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill={s <= Math.round(Number(avg || 5)) ? '#b69355' : 'none'} stroke="#b69355" />
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
                      <div className="d-flex align-items-center gap-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} fill={s <= f.rating ? '#b69355' : 'none'} stroke="#b69355" />
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
                      <Camera size={12} className="luxury-gold-icon me-1 inline" />
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
