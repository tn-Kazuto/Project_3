import React, { useState } from 'react';
import { feedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, CheckCircle2, AlertCircle, User, Mail } from 'lucide-react';

export const FeedbackPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.comment.trim()) {
      setErrorMsg('Please write your feedback message.');
      return;
    }

    if (!isAuthenticated) {
      if (!formData.senderName.trim()) {
        setErrorMsg('Please provide your name.');
        return;
      }
      if (!formData.senderEmail.trim()) {
        setErrorMsg('Please provide your email address.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        recipeId: null, // General website feedback
        senderName: isAuthenticated ? (user?.fullName || null) : formData.senderName,
        senderEmail: isAuthenticated ? (user?.email || null) : formData.senderEmail,
        comment: formData.comment,
      };

      const res = await feedbackApi.create(payload);
      if (res.data && res.data.success) {
        setSuccessMsg('Thank you for your valuable feedback! Chef James Thew and our culinary team sincerely appreciate your input.');
        setFormData({ senderName: '', senderEmail: '', comment: '' });
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Submission failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 luxury-feedback">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header Banner */}
          <div
            className="field-taupe p-4 p-md-5 mb-5 text-center"
            style={{
              backgroundColor: 'var(--dp-color-ground-2)',
              border: '1px solid var(--dp-color-panel-line)',
            }}
          >
            <div className="d-inline-flex align-items-center justify-content-center p-3 mb-3 border" style={{ borderColor: 'var(--dp-color-accent)' }}>
              <MessageSquare size={36} className="luxury-gold-icon" />
            </div>
            <div className="roman-numeral mb-2">VI &middot; VOICES & SUGGESTIONS</div>
            <h1 className="brand-font display-5 mb-3 text-dark">Website Feedback & Suggestions</h1>
            <p className="lead max-w-700 mx-auto" style={{ color: 'var(--dp-color-ink-2)' }}>
              We strive to deliver the highest quality culinary inspiration and learning experience. Let Chef James Thew know how we can improve our recipes, classes, and platform!
            </p>
          </div>

          <div
            className="p-4 p-md-5"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--dp-color-rule)',
            }}
          >
            {successMsg && (
              <div
                className="alert alert-success d-flex align-items-center gap-3 mb-4 p-3"
                style={{ borderRadius: 0, border: '1px solid #1b4d3e' }}
              >
                <CheckCircle2 size={24} className="flex-shrink-0 text-success" />
                <div>
                  <h5 className="brand-font mb-1">Feedback Received!</h5>
                  <p className="mb-0 small">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mb-4 p-3"
                style={{ borderRadius: 0 }}
              >
                <AlertCircle size={20} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isAuthenticated ? (
                <div
                  className="p-3 mb-4 d-flex align-items-center gap-2 small"
                  style={{
                    backgroundColor: 'var(--dp-color-ground-2)',
                    border: '1px solid var(--dp-color-panel-line)',
                  }}
                >
                  <User size={16} className="luxury-gold-icon" />
                  <span>
                    Submitting as registered member: <strong>{user?.fullName}</strong> ({user?.email})
                  </span>
                </div>
              ) : (
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
                        <User size={18} className="luxury-gold-icon" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        style={{ borderColor: 'var(--dp-color-rule)' }}
                        placeholder="Gordon Ramsay"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--dp-color-rule)' }}>
                        <Mail size={18} className="luxury-gold-icon" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        style={{ borderColor: 'var(--dp-color-rule)' }}
                        placeholder="gordon@example.com"
                        value={formData.senderEmail}
                        onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label fw-semibold">Your Comments / Suggestions *</label>
                <textarea
                  className="form-control"
                  style={{ borderColor: 'var(--dp-color-rule)' }}
                  rows="6"
                  placeholder="Tell us what you love, recipe suggestions, questions about weekend cooking classes, or platform improvements..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  letterSpacing: '0.14em',
                  borderRadius: 0,
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Submitting Feedback...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Feedback to Chef James Thew</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
