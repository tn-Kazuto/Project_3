import { useState, useEffect, useRef } from 'react';
import {
  recipeApi,
  tipApi,
  categoryApi,
  contestApi,
  announcementApi,
  feedbackApi,
} from '../../../services/api';

export const useAdminDashboard = () => {
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

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadAllDashboardData();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAllDashboardData = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const [catRes, recRes, tipRes, contRes, annRes, fbRes] = await Promise.all([
        categoryApi.getAll(),
        recipeApi.getAll(),
        tipApi.getAll(),
        contestApi.getAll(),
        announcementApi.getAll(),
        feedbackApi.getAll(),
      ]);

      if (!isMountedRef.current) return;
      if (catRes.data?.success) setCategories(catRes.data.data || []);
      if (recRes.data?.success) setRecipes(recRes.data.data || []);
      if (tipRes.data?.success) setTips(tipRes.data.data || []);
      if (contRes.data?.success) setContests(contRes.data.data || []);
      if (annRes.data?.success) setAnnouncements(annRes.data.data || []);
      if (fbRes.data?.success) setFeedbacks(fbRes.data.data || []);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error(err);
      setStatusMessage({ type: 'danger', text: 'Error loading dashboard metrics.' });
    } finally {
      if (isMountedRef.current) setLoading(false);
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
        setRecipeForm({
          categoryId: '',
          title: '',
          ingredients: '',
          cookingProcedure: '',
          isFree: false,
          contentType: 'ARTICLE',
          videoUrl: '',
          thumbnailUrl: '',
        });
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

  // Feedback actions
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback item?')) return;
    try {
      const res = await feedbackApi.delete(id);
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'Feedback removed successfully.' });
        setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== id));
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

  return {
    activeTab,
    setActiveTab,
    loading,
    statusMessage,
    setStatusMessage,
    categories,
    recipes,
    tips,
    contests,
    announcements,
    feedbacks,
    selectedContestForEntries,
    setSelectedContestForEntries,
    contestEntries,
    loadingEntries,
    showRecipeModal,
    setShowRecipeModal,
    showTipModal,
    setShowTipModal,
    showContestModal,
    setShowContestModal,
    showAnnouncementModal,
    setShowAnnouncementModal,
    recipeForm,
    setRecipeForm,
    tipForm,
    setTipForm,
    contestForm,
    setContestForm,
    announcementForm,
    setAnnouncementForm,
    feedbackFilter,
    setFeedbackFilter,
    filteredFeedbacks,
    loadAllDashboardData,
    handleToggleRecipeFree,
    handleDeleteRecipe,
    handleCreateRecipe,
    handleToggleTipFree,
    handleDeleteTip,
    handleCreateTip,
    handleCreateContest,
    handleDeleteContest,
    handleViewEntries,
    handleSelectWinner,
    handleCreateAnnouncement,
    handleDeleteAnnouncement,
    handleDeleteFeedback,
  };
};
