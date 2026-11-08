import React, { useState, useEffect } from 'react';
import {
  recipeApi,
  tipApi,
  categoryApi,
  contestApi,
  announcementApi,
  feedbackApi,
} from '../../services/api';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Data states
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [tips, setTips] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Contest Entries Sub-view state
  const [selectedContestForEntries, setSelectedContestForEntries] = useState(null);
  const [contestEntries, setContestEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Modal states
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Recipe Modal Form
  const [recipeForm, setRecipeForm] = useState({
    categoryId: '',
    title: '',
    ingredients: '',
    cookingProcedure: '',
    isFree: false,
    contentType: 'ARTICLE',
    videoUrl: '',
    thumbnailUrl: '',
  });

  // Tip Modal Form
  const [tipForm, setTipForm] = useState({
    categoryId: '',
    title: '',
    content: '',
    isFree: false,
  });

  // Contest Modal Form
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    contestType: 'RECIPE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  // Announcement Modal Form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    contestId: '',
    winnerEntryId: '',
  });

  // Feedback filter state
  const [feedbackFilter, setFeedbackFilter] = useState('ALL');

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    try {
      setLoading(true);
      const [catRes, recRes, tipRes, contRes, annRes, fbRes] = await Promise.all([
        categoryApi.getAll(),
        recipeApi.getAll(),
        tipApi.getAll(),
        contestApi.getAll(),
        announcementApi.getAll(),
        feedbackApi.getAll(),
      ]);

      if (catRes.data?.success) setCategories(catRes.data.data || []);
      if (recRes.data?.success) setRecipes(recRes.data.data || []);
      if (tipRes.data?.success) setTips(tipRes.data.data || []);
      if (contRes.data?.success) setContests(contRes.data.data || []);
      if (annRes.data?.success) setAnnouncements(annRes.data.data || []);
      if (fbRes.data?.success) setFeedbacks(fbRes.data.data || []);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'danger', text: 'Error loading dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  // Recipe actions
  const handleToggleRecipeFree = async (recipe) => {
    try {
      const res = await recipeApi.update(recipe.recipeId, {
        categoryId: recipe.categoryId,
        title: recipe.title,
        ingredients: recipe.ingredients,
        cookingProcedure: recipe.cookingProcedure,
        isFree: !recipe.isFree,
      });
      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: `Recipe "${recipe.title}" visibility changed to ${!recipe.isFree ? 'Free Access' : 'Members Only'}.`,
        });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to update recipe visibility.' });
    }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await recipeApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: `Recipe "${title}" deleted.` });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to delete recipe.' });
    }
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    try {
      const res = await recipeApi.create({
        categoryId: parseInt(recipeForm.categoryId || categories[0]?.categoryId),
        title: recipeForm.title,
        ingredients: recipeForm.ingredients,
        cookingProcedure: recipeForm.cookingProcedure,
        isFree: recipeForm.isFree,
        contentType: recipeForm.contentType || 'ARTICLE',
        videoUrl: recipeForm.videoUrl?.trim() || null,
        thumbnailUrl: recipeForm.thumbnailUrl?.trim() || null,
      });
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'New recipe created successfully!' });
        setShowRecipeModal(false);
        setRecipeForm({ categoryId: '', title: '', ingredients: '', cookingProcedure: '', isFree: false, contentType: 'ARTICLE', videoUrl: '', thumbnailUrl: '' });
        loadAllDashboardData();
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to create recipe.' });
    }
  };

  // Tip actions
  const handleToggleTipFree = async (tip) => {
    try {
      const res = await tipApi.update(tip.tipId, {
        categoryId: tip.categoryId,
        title: tip.title,
        content: tip.content,
        isFree: !tip.isFree,
      });
      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: `Tip "${tip.title}" visibility changed to ${!tip.isFree ? 'Free Access' : 'Members Only'}.`,
        });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to update tip visibility.' });
    }
  };

  const handleDeleteTip = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete tip "${title}"?`)) return;
    try {
      const res = await tipApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: `Tip "${title}" deleted.` });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to delete tip.' });
    }
  };

  const handleCreateTip = async (e) => {
    e.preventDefault();
    try {
      const res = await tipApi.create({
        categoryId: parseInt(tipForm.categoryId || categories[0]?.categoryId),
        title: tipForm.title,
        content: tipForm.content,
        isFree: tipForm.isFree,
      });
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'New cooking tip created successfully!' });
        setShowTipModal(false);
        setTipForm({ categoryId: '', title: '', content: '', isFree: false });
        loadAllDashboardData();
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to create tip.' });
    }
  };

  // Contest actions
  const handleCreateContest = async (e) => {
    e.preventDefault();
    try {
      const res = await contestApi.create({
        title: contestForm.title,
        description: contestForm.description,
        contestType: contestForm.contestType,
        startDate: new Date(contestForm.startDate).toISOString(),
        endDate: new Date(contestForm.endDate + 'T23:59:59Z').toISOString(),
        isActive: true,
      });
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'New contest launched successfully!' });
        setShowContestModal(false);
        setContestForm({
          title: '',
          description: '',
          contestType: 'RECIPE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        });
        loadAllDashboardData();
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to launch contest.' });
    }
  };

  const handleDeleteContest = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete contest "${title}"?`)) return;
    try {
      const res = await contestApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: `Contest "${title}" deleted.` });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to delete contest.' });
    }
  };

  const handleViewEntries = async (contest) => {
    setSelectedContestForEntries(contest);
    setLoadingEntries(true);
    try {
      const res = await contestApi.getEntries(contest.contestId);
      if (res.data?.success) {
        setContestEntries(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'danger', text: 'Failed to load entries for this contest.' });
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleSelectWinner = async (entry) => {
    try {
      const res = await contestApi.selectWinner(entry.entryId);
      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: `Entry "${entry.title}" by ${entry.submitterName} has been declared WINNER!`,
        });
        // Pre-fill announcement form for immediate publishing
        setAnnouncementForm({
          title: `Winner Declared: ${entry.contestTitle}!`,
          content: `Congratulations to ${entry.submitterName} for winning "${entry.contestTitle}" with the masterpiece "${entry.title}"!`,
          contestId: entry.contestId,
          winnerEntryId: entry.entryId,
        });
        setShowAnnouncementModal(true);
        // Refresh entries and contests
        handleViewEntries(selectedContestForEntries);
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to set winner.' });
    }
  };

  // Announcement actions
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await announcementApi.create({
        title: announcementForm.title,
        content: announcementForm.content,
        contestId: announcementForm.contestId ? parseInt(announcementForm.contestId) : null,
        winnerEntryId: announcementForm.winnerEntryId ? parseInt(announcementForm.winnerEntryId) : null,
      });
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'Announcement published successfully!' });
        setShowAnnouncementModal(false);
        setAnnouncementForm({ title: '', content: '', contestId: '', winnerEntryId: '' });
        loadAllDashboardData();
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to publish announcement.' });
    }
  };

  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${title}"?`)) return;
    try {
      const res = await announcementApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: `Announcement "${title}" removed.` });
        loadAllDashboardData();
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to delete announcement.' });
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback item?')) return;
    try {
      const res = await feedbackApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'Feedback removed successfully.' });
        setFeedbacks(feedbacks.filter((f) => f.feedbackId !== id));
      } else {
        setStatusMessage({ type: 'danger', text: 'Failed to delete feedback.' });
      }
    } catch {
      setStatusMessage({ type: 'danger', text: 'Failed to delete feedback.' });
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (feedbackFilter === 'RECIPE') return fb.recipeId !== null;
    if (feedbackFilter === 'GENERAL') return fb.recipeId === null;
    return true;
  });

  return (
    <div className="container-fluid py-4 px-md-5 luxury-admin">
      {/* Admin Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div>
          <div className="roman-numeral mb-1">EXECUTIVE &middot; ADMINISTRATIVE NEXUS</div>
          <span
            className="badge font-monospace mb-2 px-3 py-1"
            style={{
              backgroundColor: 'var(--dp-color-field)',
              color: 'var(--dp-color-accent)',
              borderRadius: 0,
              border: '1px solid var(--dp-color-accent)',
            }}
          >
            Master Chef Administration
          </span>
          <h1 className="brand-font display-6 fw-bold mb-1 text-dark">Chef James Thew Executive Dashboard</h1>
          <p className="text-muted mb-0 small">Complete platform management for recipes, contests, announcements, and feedbacks.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)', letterSpacing: '0.12em' }}
            onClick={loadAllDashboardData}
          >
            Refresh
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert" style={{ borderRadius: 0 }}>
          <span>{statusMessage.text}</span>
          <button type="button" className="btn-close" onClick={() => setStatusMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Navigation Tabs (Pure Typography) */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'overview' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'overview' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('overview'); setSelectedContestForEntries(null); }}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'recipes' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'recipes' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'recipes' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('recipes'); setSelectedContestForEntries(null); }}
          >
            Recipes ({recipes.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'tips' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'tips' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'tips' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'tips' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('tips'); setSelectedContestForEntries(null); }}
          >
            Cooking Tips ({tips.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'contests' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'contests' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'contests' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'contests' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('contests'); setSelectedContestForEntries(null); }}
          >
            Contests ({contests.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'announcements' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'announcements' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'announcements' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('announcements'); setSelectedContestForEntries(null); }}
          >
            Announcements ({announcements.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'feedback' ? 'var(--dp-color-field)' : 'transparent',
              color: activeTab === 'feedback' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
              border: activeTab === 'feedback' ? '1px solid var(--dp-color-accent)' : '1px solid var(--dp-color-rule)',
              borderRadius: 0,
              letterSpacing: '0.12em',
            }}
            onClick={() => { setActiveTab('feedback'); setSelectedContestForEntries(null); }}
          >
            Feedbacks ({feedbacks.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-sm-6 col-xl-3">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Total Recipes</span>
                <span className="font-monospace small text-muted">I.</span>
              </div>
              <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{recipes.length}</h2>
              <div className="small font-monospace text-muted">
                <span className="fw-semibold text-success">{recipes.filter((r) => r.isFree).length} Free</span> &middot;{' '}
                <span className="fw-semibold text-dark">{recipes.filter((r) => !r.isFree).length} Members</span>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Cooking Tips</span>
                <span className="font-monospace small text-muted">II.</span>
              </div>
              <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{tips.length}</h2>
              <div className="small font-monospace text-muted">
                <span className="fw-semibold text-success">{tips.filter((t) => t.isFree).length} Free</span> &middot;{' '}
                <span className="fw-semibold text-dark">{tips.filter((t) => !t.isFree).length} Members</span>
              </div>
            </div>
          </div>

          {/* Featured Charcoal Stat Card: Contests */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: 'var(--dp-color-field)',
                color: 'var(--dp-color-on-field)',
                border: '1px solid var(--dp-color-accent)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em', color: 'var(--dp-color-accent)' }}>
                  Culinary Contests
                </span>
                <span className="font-monospace small" style={{ color: 'var(--dp-color-accent)' }}>III.</span>
              </div>
              <h2 className="brand-font display-5 fw-bold mb-1 text-white">{contests.length}</h2>
              <div className="small font-monospace" style={{ color: 'var(--dp-color-on-field-2)' }}>
                <span className="fw-semibold text-success">{contests.filter((c) => c.isActive).length} Active</span> &middot;{' '}
                <span>{contests.reduce((acc, c) => acc + (c.entryCount || 0), 0)} Total Submissions</span>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div
              className="p-4 h-100"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase small fw-semibold font-monospace" style={{ letterSpacing: '0.12em' }}>Feedbacks & Reviews</span>
                <span className="font-monospace small text-muted">IV.</span>
              </div>
              <h2 className="brand-font display-5 fw-bold mb-1 text-dark">{feedbacks.length}</h2>
              <div className="small font-monospace text-muted">
                <span>{feedbacks.filter((f) => f.recipeId).length} Recipe Reviews</span> &middot;{' '}
                <span>{feedbacks.filter((f) => !f.recipeId).length} Site Feedbacks</span>
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <div
              className="p-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-rule)',
              }}
            >
              <div className="mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
                <h5 className="brand-font mb-0 text-dark">Quick Actions</h5>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-on-field)',
                    letterSpacing: '0.12em',
                    borderRadius: 0,
                  }}
                  onClick={() => setShowRecipeModal(true)}
                >
                  + New Recipe
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  style={{
                    borderColor: 'var(--dp-color-rule)',
                    color: 'var(--dp-color-ink)',
                    letterSpacing: '0.12em',
                    borderRadius: 0,
                  }}
                  onClick={() => setShowTipModal(true)}
                >
                  + New Cooking Tip
                </button>
                <button
                  className="btn btn-warning text-white fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'var(--dp-color-accent)',
                    borderColor: 'var(--dp-color-accent)',
                    letterSpacing: '0.12em',
                    borderRadius: 0,
                  }}
                  onClick={() => setShowContestModal(true)}
                >
                  + Launch Contest
                </button>
                <button
                  className="btn btn-outline-dark d-flex align-items-center gap-2"
                  style={{
                    borderColor: 'var(--dp-color-accent)',
                    letterSpacing: '0.12em',
                    borderRadius: 0,
                  }}
                  onClick={() => setShowAnnouncementModal(true)}
                >
                  + Publish Announcement
                </button>
              </div>
            </div>
          </div>

          {/* Executive Atelier Intelligence & Architecture Metrics */}
          <div className="col-12 mt-4">
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--dp-color-ground-2)',
                border: '1px solid var(--dp-color-panel-line)',
              }}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--dp-color-panel-line)' }}>
                <div>
                  <h5 className="brand-font mb-0 text-dark">Executive Atelier Architecture & System Metrics</h5>
                </div>
                <span
                  className="badge font-monospace"
                  style={{
                    backgroundColor: 'var(--dp-color-field)',
                    color: 'var(--dp-color-accent)',
                    border: '1px solid var(--dp-color-accent)',
                    borderRadius: 0,
                  }}
                >
                  100% Operational Integrity
                </span>
              </div>

              <div className="row g-3">
                <div className="col-md-3 col-sm-6">
                  <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>TOTAL ASSETS</div>
                    <div className="brand-font h4 mb-0 text-dark">{recipes.length + tips.length} Master Items</div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                      {recipes.length} Recipes &middot; {tips.length} Tips
                    </small>
                  </div>
                </div>

                <div className="col-md-3 col-sm-6">
                  <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>PREMIUM GATEKEEPING</div>
                    <div className="brand-font h4 mb-0 text-dark">
                      {recipes.filter((r) => !r.isFree).length + tips.filter((t) => !t.isFree).length} VIP Reserved
                    </div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                      Protected by JWT & Access Filter
                    </small>
                  </div>
                </div>

                <div className="col-md-3 col-sm-6">
                  <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>CONTEST ENGAGEMENT</div>
                    <div className="brand-font h4 mb-0 text-dark">
                      {contests.reduce((acc, c) => acc + (c.entryCount || 0), 0)} Submissions
                    </div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                      Across {contests.length} Official Competitions
                    </small>
                  </div>
                </div>

                <div className="col-md-3 col-sm-6">
                  <div className="p-3 bg-white border" style={{ borderColor: 'var(--dp-color-rule)' }}>
                    <div className="roman-numeral mb-1" style={{ fontSize: '0.75rem' }}>COMMUNITY FEEDBACK</div>
                    <div className="brand-font h4 mb-0 text-dark">{feedbacks.length} Reviews</div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                      Two-Way Atelier Communication
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPES MANAGEMENT */}
      {activeTab === 'recipes' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Recipes Catalog Management</h5>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowRecipeModal(true)}>
              + Add Recipe
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Format</th>
                  <th>Author</th>
                  <th>Access Tier</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r) => (
                  <tr key={r.recipeId}>
                    <td className="fw-bold text-dark">{r.title}</td>
                    <td><span className="badge bg-light text-dark border">{r.categoryName}</span></td>
                    <td>
                      <span className="badge font-monospace text-uppercase" style={{ backgroundColor: '#4a5568', color: '#fff' }}>
                        {r.contentType || 'ARTICLE'}
                      </span>
                      {r.shareCount > 0 && (
                        <span className="small text-muted ms-2">
                          {r.shareCount} shares
                        </span>
                      )}
                    </td>
                    <td>{r.authorName}</td>
                    <td>
                      <span className={`badge ${r.isFree ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {r.isFree ? 'Free Access' : 'Members Only'}
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm me-2 ${r.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        title={r.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                        onClick={() => handleToggleRecipeFree(r)}
                      >
                        {r.isFree ? 'Set Member-only' : 'Set Free'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Recipe"
                        onClick={() => handleDeleteRecipe(r.recipeId, r.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIPS MANAGEMENT */}
      {activeTab === 'tips' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Cooking Tips Management</h5>
            <button className="btn btn-info text-white btn-sm d-flex align-items-center gap-1" onClick={() => setShowTipModal(true)}>
              + Add Tip
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Access Tier</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tips.map((t) => (
                  <tr key={t.tipId}>
                    <td className="fw-bold text-dark">{t.title}</td>
                    <td><span className="badge bg-light text-dark border">{t.categoryName}</span></td>
                    <td>{t.authorName}</td>
                    <td>
                      <span className={`badge ${t.isFree ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {t.isFree ? 'Free Access' : 'Members Only'}
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm me-2 ${t.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        title={t.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                        onClick={() => handleToggleTipFree(t)}
                      >
                        {t.isFree ? 'Set Member-only' : 'Set Free'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Tip"
                        onClick={() => handleDeleteTip(t.tipId, t.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONTESTS MANAGEMENT & ENTRIES VIEW */}
      {activeTab === 'contests' && (
        <div>
          {selectedContestForEntries ? (
            /* Sub-view: Contest Entries */
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setSelectedContestForEntries(null)}>
                    ← Back to Contests
                  </button>
                  <strong className="h5 mb-0 align-middle">Submissions for: {selectedContestForEntries.title}</strong>
                </div>
                <span className="badge bg-primary fs-6">{contestEntries.length} Submissions</span>
              </div>
              <div className="card-body p-0">
                {loadingEntries ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading entries...</p>
                  </div>
                ) : contestEntries.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No entries submitted yet for this contest.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Submission Title</th>
                          <th>Submitter</th>
                          <th>Type</th>
                          <th>Community Votes</th>
                          <th>Details / Content</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contestEntries.map((e) => (
                          <tr key={e.entryId} className={e.isWinner ? 'table-warning' : ''}>
                            <td className="fw-bold">{e.title}</td>
                            <td>
                              <div>{e.submitterName}</div>
                              <small className="text-muted">{e.submitterEmail}</small>
                            </td>
                            <td>
                              <span className={`badge ${e.isGuest ? 'bg-secondary' : 'bg-primary'}`}>
                                {e.isGuest ? 'Guest' : 'Member'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border font-monospace">
                                {e.voteCount || 0} votes
                              </span>
                              {contestEntries.length > 0 && e.voteCount > 0 && e.voteCount === Math.max(...contestEntries.map(x => x.voteCount)) && (
                                <span className="badge bg-warning text-dark ms-1 small font-monospace">
                                  Top Voted
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="small text-truncate" style={{ maxWidth: '280px' }}>
                                {e.contestType === 'RECIPE'
                                  ? `${e.ingredients || ''}`
                                  : `${e.tipContent || ''}`}
                              </div>
                            </td>
                            <td>
                              {e.isWinner ? (
                                <span className="badge bg-warning text-dark fw-bold">
                                  Winner
                                </span>
                              ) : (
                                <span className="badge bg-light text-muted border">Participant</span>
                              )}
                            </td>
                            <td className="text-end">
                              {!e.isWinner && (
                                <button
                                  className="btn btn-sm btn-warning text-dark fw-semibold"
                                  onClick={() => handleSelectWinner(e)}
                                >
                                  Select Winner
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Contests Table */
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Culinary Contests Management</h5>
                <button className="btn btn-warning text-dark fw-semibold btn-sm d-flex align-items-center gap-1" onClick={() => setShowContestModal(true)}>
                  + Create Contest
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Contest Type</th>
                      <th>Duration</th>
                      <th>Entries</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contests.map((c) => (
                      <tr key={c.contestId}>
                        <td className="fw-bold text-dark">{c.title}</td>
                        <td>
                          <span className={`badge ${c.contestType === 'RECIPE' ? 'bg-primary' : 'bg-info text-dark'}`}>
                            {c.contestType}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{c.entryCount || 0}</span>
                        </td>
                        <td>
                          <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {c.isActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleViewEntries(c)}
                          >
                            View Entries
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Contest"
                            onClick={() => handleDeleteContest(c.contestId, c.title)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Announcements Management</h5>
            <button className="btn btn-secondary btn-sm d-flex align-items-center gap-1" onClick={() => setShowAnnouncementModal(true)}>
              + Publish Announcement
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Contest Linked</th>
                  <th>Winner Declared</th>
                  <th>Published Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.announcementId}>
                    <td className="fw-bold text-dark">{a.title}</td>
                    <td>{a.contestTitle || <span className="text-muted">—</span>}</td>
                    <td>
                      {a.winnerName ? (
                        <span className="badge bg-warning text-dark fw-bold">
                          {a.winnerName}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="small text-muted">{new Date(a.publishedAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Announcement"
                        onClick={() => handleDeleteAnnouncement(a.announcementId, a.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="fw-bold mb-0">User Reviews & Feedback</h5>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${feedbackFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFeedbackFilter('ALL')}
              >
                All ({feedbacks.length})
              </button>
              <button
                className={`btn ${feedbackFilter === 'RECIPE' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFeedbackFilter('RECIPE')}
              >
                Recipe Reviews ({feedbacks.filter((f) => f.recipeId).length})
              </button>
              <button
                className={`btn ${feedbackFilter === 'GENERAL' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFeedbackFilter('GENERAL')}
              >
                Website Feedback ({feedbacks.filter((f) => !f.recipeId).length})
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Sender</th>
                  <th>Target</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Media Attachment</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((f) => (
                  <tr key={f.feedbackId}>
                    <td>
                      <div className="fw-semibold">{f.senderName}</div>
                      <small className="text-muted">{f.senderEmail}</small>
                      <div className="mt-1">
                        <span className={`badge ${f.isGuest ? 'bg-secondary' : 'bg-info text-dark'}`}>
                          {f.isGuest ? 'Guest' : 'Member'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {f.recipeTitle ? (
                        <span className="badge bg-light text-primary border">🍲 Recipe: {f.recipeTitle}</span>
                      ) : (
                        <span className="badge bg-light text-dark border">🌐 General Website</span>
                      )}
                    </td>
                    <td>
                      {f.rating > 0 ? (
                        <div className="d-flex align-items-center gap-1 font-monospace small" style={{ color: '#b69355' }}>
                          <span>{f.rating} / 5</span>
                        </div>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'pre-line' }}>{f.comment}</td>
                    <td>
                      {f.mediaUrl ? (
                        <a href={f.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>
                          <span>View Media</span>
                        </a>
                      ) : (
                        <span className="text-muted small">None</span>
                      )}
                    </td>
                    <td className="small text-muted">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteFeedback(f.feedbackId)}
                        title="Delete feedback"
                        aria-label="Delete feedback"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE RECIPE MODAL */}
      {showRecipeModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Add New Master Recipe</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRecipeModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRecipe}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Recipe Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Handmade Fettuccine al Tartufo"
                        value={recipeForm.title}
                        onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={recipeForm.categoryId}
                        onChange={(e) => setRecipeForm({ ...recipeForm, categoryId: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Ingredients List *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="List of ingredients..."
                        value={recipeForm.ingredients}
                        onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Cooking Procedure *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Step by step cooking procedure..."
                        value={recipeForm.cookingProcedure}
                        onChange={(e) => setRecipeForm({ ...recipeForm, cookingProcedure: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Media Format *</label>
                      <select
                        className="form-select"
                        value={recipeForm.contentType}
                        onChange={(e) => setRecipeForm({ ...recipeForm, contentType: e.target.value })}
                      >
                        <option value="ARTICLE">Article (Written Recipe)</option>
                        <option value="VIDEO">Video Masterclass</option>
                        <option value="TALKSHOW">Culinary Talkshow</option>
                        <option value="LIVESHOW">Live Cooking Show</option>
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Video Stream URL (YouTube, Vimeo, MP4)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://www.youtube.com/watch?v=... or direct mp4"
                        value={recipeForm.videoUrl}
                        onChange={(e) => setRecipeForm({ ...recipeForm, videoUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Thumbnail / Cover Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={recipeForm.thumbnailUrl}
                        onChange={(e) => setRecipeForm({ ...recipeForm, thumbnailUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch p-3 bg-light rounded-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="adminRecipeIsFreeSwitch"
                          checked={recipeForm.isFree}
                          onChange={(e) => setRecipeForm({ ...recipeForm, isFree: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold ms-2" htmlFor="adminRecipeIsFreeSwitch">
                          {recipeForm.isFree ? '🔓 Free Access (Open to Guests)' : '🔒 Members Only (Paid Subscription)'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowRecipeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold">
                    Save Recipe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TIP MODAL */}
      {showTipModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">Add New Culinary Tip</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTipModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTip}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Tip Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Master Chef Knife Sharpening Angle"
                        value={tipForm.title}
                        onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={tipForm.categoryId}
                        onChange={(e) => setTipForm({ ...tipForm, categoryId: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Tip Content & Technique *</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Describe the kitchen tip or culinary technique..."
                        value={tipForm.content}
                        onChange={(e) => setTipForm({ ...tipForm, content: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch p-3 bg-light rounded-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="adminTipIsFreeSwitch"
                          checked={tipForm.isFree}
                          onChange={(e) => setTipForm({ ...tipForm, isFree: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold ms-2" htmlFor="adminTipIsFreeSwitch">
                          {tipForm.isFree ? '🔓 Free Access (Open to Guests)' : '🔒 Members Only (Paid Subscription)'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowTipModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-info text-white fw-semibold">
                    Save Cooking Tip
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CONTEST MODAL */}
      {showContestModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title fw-bold">Launch New Culinary Contest</h5>
                <button type="button" className="btn-close" onClick={() => setShowContestModal(false)}></button>
              </div>
              <form onSubmit={handleCreateContest}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Contest Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Master Chef Mediterranean Seafood Cup"
                        value={contestForm.title}
                        onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Contest Type *</label>
                      <select
                        className="form-select"
                        value={contestForm.contestType}
                        onChange={(e) => setContestForm({ ...contestForm, contestType: e.target.value })}
                        required
                      >
                        <option value="RECIPE">Recipe Contest (Món ăn)</option>
                        <option value="TIP">Tip Contest (Mẹo bếp)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Contest Description & Rules *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Explain contest challenge, scoring criteria, and prizes..."
                        value={contestForm.description}
                        onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={contestForm.startDate}
                        onChange={(e) => setContestForm({ ...contestForm, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">End Date (Submission Deadline) *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={contestForm.endDate}
                        onChange={(e) => setContestForm({ ...contestForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowContestModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold">
                    Launch Contest
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">Publish Official Announcement</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAnnouncementModal(false)}></button>
              </div>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Announcement Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Official Winner Declaration: Seafood Challenge"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Link to Contest (Optional)</label>
                      <select
                        className="form-select"
                        value={announcementForm.contestId}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, contestId: e.target.value })}
                      >
                        <option value="">None (General News)</option>
                        {contests.map((c) => (
                          <option key={c.contestId} value={c.contestId}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Winner Entry ID (Optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Entry ID of winning submission"
                        value={announcementForm.winnerEntryId}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, winnerEntryId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Announcement Content *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Write announcement body..."
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAnnouncementModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold">
                    Publish Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

