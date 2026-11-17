import React, { useState, useEffect, useRef } from 'react';
import {
  recipeApi,
  tipApi,
  categoryApi,
  contestApi,
  announcementApi,
  feedbackApi,
} from '../../services/api';
import { uploadMediaFile } from '../../services/mediaUpload';
import { RecipeVideoField } from '../../components/common/RecipeVideoField';
import { isSupportedRecipeVideoUrl } from '../../utils/recipeVideo';
import { AdminMembersPanel } from './components/AdminMembersPanel';
import AdminPagination from './components/AdminPagination';
import AdminTableState from './components/AdminTableState';
import { AdminDashboardNav } from './components/AdminDashboardNav';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminRecipesTab } from './tabs/AdminRecipesTab';
import { AdminTipsTab } from './tabs/AdminTipsTab';
import { AdminContestsTab } from './tabs/AdminContestsTab';
import { AdminAnnouncementsTab } from './tabs/AdminAnnouncementsTab';
import { AdminFeedbackTab } from './tabs/AdminFeedbackTab';
import { AdminRecipeModal } from './modals/AdminRecipeModal';
import { AdminTipModal } from './modals/AdminTipModal';
import { AdminContestModal } from './modals/AdminContestModal';
import { AdminAnnouncementModal } from './modals/AdminAnnouncementModal';

const INITIAL_PAGE_SIZE = 10;

const getPagedPayload = (response) => {
  const payload = response?.data?.data;
  if (!response?.data?.success || !payload || !Array.isArray(payload.items)) {
    throw new Error(response?.data?.message || 'The server returned an invalid paginated response.');
  }
  return payload;
};

const getRequestError = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [uploadingRecipeVideo, setUploadingRecipeVideo] = useState(false);

  // Data states
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipePage, setRecipePage] = useState(1);
  const [recipePageSize, setRecipePageSize] = useState(INITIAL_PAGE_SIZE);
  const [recipeTotalCount, setRecipeTotalCount] = useState(0);
  const [recipeFreeCount, setRecipeFreeCount] = useState(0);
  const [recipeMemberCount, setRecipeMemberCount] = useState(0);
  const [tips, setTips] = useState([]);
  const [tipPage, setTipPage] = useState(1);
  const [tipPageSize, setTipPageSize] = useState(INITIAL_PAGE_SIZE);
  const [tipTotalCount, setTipTotalCount] = useState(0);
  const [tipFreeCount, setTipFreeCount] = useState(0);
  const [tipMemberCount, setTipMemberCount] = useState(0);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalCounts, setTotalCounts] = useState({ recipes: 0, tips: 0, contests: 0, announcements: 0, feedback: 0 });
  const [overviewCounts, setOverviewCounts] = useState({
    recipeFree: 0,
    recipeMembers: 0,
    tipFree: 0,
    tipMembers: 0,
    contestsActive: 0,
    contestSubmissions: 0,
    recipeFeedback: 0,
    siteFeedback: 0,
  });
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [pages, setPages] = useState({ recipes: 1, tips: 1, contests: 1, announcements: 1, feedback: 1 });
  const [pageMeta, setPageMeta] = useState({});
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [announcementContests, setAnnouncementContests] = useState([]);

  // Contest Entries Sub-view state
  const [selectedContestForEntries, setSelectedContestForEntries] = useState(null);
  const [contestEntries, setContestEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entryError, setEntryError] = useState('');
  const [entryPage, setEntryPage] = useState(1);
  const [entryMeta, setEntryMeta] = useState({ pageIndex: 1, pageSize: INITIAL_PAGE_SIZE, totalCount: 0, totalPages: 0 });

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
    videoFile: null,
    thumbnailFile: null,
  });
  const [savingRecipe, setSavingRecipe] = useState(false);

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
  const listRequestIdRef = useRef(0);
  const entryRequestIdRef = useRef(0);
  const pageMetaRef = useRef({});
  const entryMetaRef = useRef({ pageIndex: 1, pageSize: INITIAL_PAGE_SIZE, totalCount: 0, totalPages: 0 });

  const loadDashboardSummary = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      const oneItemPage = { page: 1, pageSize: 1 };
      const [
        catRes,
        recipeRes,
        recipeFreeRes,
        recipeMembersRes,
        tipRes,
        tipFreeRes,
        tipMembersRes,
        contestSummaryRes,
        announcementRes,
        feedbackRes,
        recipeFeedbackRes,
        siteFeedbackRes,
      ] = await Promise.all([
        categoryApi.getAll(),
        recipeApi.getPaged(oneItemPage),
        recipeApi.getPaged({ ...oneItemPage, isFreeOnly: true }),
        recipeApi.getPaged({ ...oneItemPage, isFreeOnly: false }),
        tipApi.getPaged(oneItemPage),
        tipApi.getPaged({ ...oneItemPage, isFreeOnly: true }),
        tipApi.getPaged({ ...oneItemPage, isFreeOnly: false }),
        contestApi.getSummary(),
        announcementApi.getPaged(oneItemPage),
        feedbackApi.getPaged({ ...oneItemPage, feedbackType: 'ALL' }),
        feedbackApi.getPaged({ ...oneItemPage, feedbackType: 'RECIPE' }),
        feedbackApi.getPaged({ ...oneItemPage, feedbackType: 'GENERAL' }),
      ]);

      if (!isMountedRef.current) return;
      const recipePage = getPagedPayload(recipeRes);
      const tipPage = getPagedPayload(tipRes);
      const announcementPage = getPagedPayload(announcementRes);
      const feedbackPage = getPagedPayload(feedbackRes);
      const contestSummary = contestSummaryRes.data?.data;
      if (!contestSummaryRes.data?.success || !contestSummary) {
        throw new Error(contestSummaryRes.data?.message || 'The server returned invalid contest summary data.');
      }
      setCategories(catRes.data?.success ? catRes.data.data || [] : []);
      setTotalCounts({
        recipes: recipePage.totalCount,
        tips: tipPage.totalCount,
        contests: contestSummary.totalContests,
        announcements: announcementPage.totalCount,
        feedback: feedbackPage.totalCount,
      });
      setOverviewCounts({
        recipeFree: getPagedPayload(recipeFreeRes).totalCount,
        recipeMembers: getPagedPayload(recipeMembersRes).totalCount,
        tipFree: getPagedPayload(tipFreeRes).totalCount,
        tipMembers: getPagedPayload(tipMembersRes).totalCount,
        contestsActive: contestSummary.activeContests,
        contestSubmissions: contestSummary.totalSubmissions,
        recipeFeedback: getPagedPayload(recipeFeedbackRes).totalCount,
        siteFeedback: getPagedPayload(siteFeedbackRes).totalCount,
      });
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMountedRef.current) return;
      setStatusMessage({ type: 'danger', text: getRequestError(err, 'Unable to load dashboard metrics. Please retry.') });
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const loadManagementPage = async (tab, page = pages[tab], requestedPageSize = pageSize, filter = feedbackFilter) => {
    const requestId = ++listRequestIdRef.current;
    const params = { page, pageSize: requestedPageSize };
    const requests = {
      recipes: () => recipeApi.getPaged(params),
      tips: () => tipApi.getPaged(params),
      contests: () => contestApi.getPaged(params),
      announcements: () => announcementApi.getPaged(params),
      feedback: () => feedbackApi.getPaged({ ...params, feedbackType: filter }),
    };
    if (!requests[tab]) return;

    setListLoading(true);
    setListError('');
    try {
      const payload = getPagedPayload(await requests[tab]());
      if (!isMountedRef.current || requestId !== listRequestIdRef.current) return;
      const lastPage = Math.max(1, payload.totalPages);
      if (page > lastPage) {
        setPages((current) => ({ ...current, [tab]: lastPage }));
        return;
      }
      const previousPage = pageMetaRef.current[tab];
      if (page > 1 && previousPage && previousPage.totalCount !== payload.totalCount) {
        setPages((current) => ({ ...current, [tab]: 1 }));
        return;
      }

      if (tab === 'recipes') setRecipes(payload.items);
      if (tab === 'tips') setTips(payload.items);
      if (tab === 'contests') setContests(payload.items);
      if (tab === 'announcements') setAnnouncements(payload.items);
      if (tab === 'feedback') setFeedbacks(payload.items);
      pageMetaRef.current = { ...pageMetaRef.current, [tab]: payload };
      setPageMeta((current) => ({ ...current, [tab]: payload }));
      if (tab !== 'feedback' || filter === 'ALL') {
        setTotalCounts((current) => ({ ...current, [tab]: payload.totalCount }));
      }
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMountedRef.current || requestId !== listRequestIdRef.current) return;
      setListError(getRequestError(err, 'Unable to load this management list.'));
    } finally {
      if (isMountedRef.current && requestId === listRequestIdRef.current) setListLoading(false);
    }
  };

  const loadContestEntries = async (contest, page = entryPage, requestedPageSize = pageSize) => {
    if (!contest) return;
    const requestId = ++entryRequestIdRef.current;
    setLoadingEntries(true);
    setEntryError('');
    try {
      const response = await contestApi.getEntries(contest.contestId, { page, pageSize: requestedPageSize });
      const payload = getPagedPayload(response);
      if (!isMountedRef.current || requestId !== entryRequestIdRef.current) return;
      const lastPage = Math.max(1, payload.totalPages);
      if (page > lastPage) {
        setEntryPage(lastPage);
        return;
      }
      if (page > 1 && entryMetaRef.current.totalCount !== payload.totalCount) {
        setEntryPage(1);
        return;
      }
      setContestEntries(payload.items);
      entryMetaRef.current = payload;
      setEntryMeta(payload);
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMountedRef.current || requestId !== entryRequestIdRef.current) return;
      setEntryError(getRequestError(err, 'Unable to load contest submissions.'));
    } finally {
      if (isMountedRef.current && requestId === entryRequestIdRef.current) setLoadingEntries(false);
    }
  };

  const loadAllDashboardData = async () => {
    await loadDashboardSummary();
    if (activeTab !== 'overview') {
      await loadManagementPage(activeTab, pages[activeTab], pageSize, feedbackFilter);
      if (activeTab === 'contests' && selectedContestForEntries) {
        await loadContestEntries(selectedContestForEntries, entryPage, pageSize);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardSummary();
    return () => {
      isMountedRef.current = false;
      listRequestIdRef.current += 1;
      entryRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') return undefined;
    const refreshActivePage = () => {
      if (document.visibilityState === 'visible') {
        loadManagementPage(activeTab, pages[activeTab], pageSize, feedbackFilter);
      }
    };
    refreshActivePage();
    const intervalId = window.setInterval(refreshActivePage, 30000);
    return () => window.clearInterval(intervalId);
  }, [activeTab, pages[activeTab], pageSize, feedbackFilter]);

  useEffect(() => {
    if (activeTab !== 'contests' || !selectedContestForEntries) return undefined;
    const refreshEntries = () => {
      if (document.visibilityState === 'visible') {
        loadContestEntries(selectedContestForEntries, entryPage, pageSize);
      }
    };
    refreshEntries();
    const intervalId = window.setInterval(refreshEntries, 30000);
    return () => window.clearInterval(intervalId);
  }, [activeTab, selectedContestForEntries?.contestId, entryPage, pageSize]);
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
    if (uploadingRecipeVideo) return;
    if (recipeForm.videoUrl && !isSupportedRecipeVideoUrl(recipeForm.videoUrl)) {
      setStatusMessage({ type: 'danger', text: 'Use a secure YouTube or Vimeo link, or a direct HTTPS video file.' });
      return;
    }
    setSavingRecipe(true);
    try {
      const videoUrl = recipeForm.videoFile
        ? await uploadMediaFile(recipeForm.videoFile, 'video')
        : recipeForm.videoUrl?.trim() || null;
      const thumbnailUrl = recipeForm.thumbnailFile
        ? await uploadMediaFile(recipeForm.thumbnailFile, 'image')
        : recipeForm.thumbnailUrl?.trim() || null;
      const res = await recipeApi.create({
        categoryId: parseInt(recipeForm.categoryId || categories[0]?.categoryId),
        title: recipeForm.title,
        ingredients: recipeForm.ingredients,
        cookingProcedure: recipeForm.cookingProcedure,
        isFree: recipeForm.isFree,
        contentType: recipeForm.videoFile && recipeForm.contentType === 'ARTICLE'
          ? 'VIDEO'
          : recipeForm.contentType || 'ARTICLE',
        videoUrl,
        thumbnailUrl,
      });
      if (res.data?.success) {
        setStatusMessage({ type: 'success', text: 'New recipe created successfully!' });
        setShowRecipeModal(false);
        setRecipeForm({ categoryId: '', title: '', ingredients: '', cookingProcedure: '', isFree: false, contentType: 'ARTICLE', videoUrl: '', thumbnailUrl: '', videoFile: null, thumbnailFile: null });
        loadAllDashboardData();
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.response?.data?.message || err.message || 'Failed to create recipe.' });
    } finally {
      setSavingRecipe(false);
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
    setEntryPage(1);
    setLoadingEntries(true);
    setContestEntries([]);
    setEntryMeta({ pageIndex: 1, pageSize, totalCount: 0, totalPages: 0 });
    setEntryError('');
  };

  const handleOpenAnnouncementModal = async () => {
    setShowAnnouncementModal(true);
    try {
      const response = await contestApi.getAll();
      if (response.data?.success) setAnnouncementContests(response.data.data || []);
    } catch (err) {
      setStatusMessage({ type: 'danger', text: getRequestError(err, 'Unable to load contests for the announcement form.') });
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
        setAnnouncementContests((current) => [
          selectedContestForEntries,
          ...current.filter((contest) => contest.contestId !== selectedContestForEntries?.contestId),
        ].filter(Boolean));
        setShowAnnouncementModal(true);
        // Refresh entries and contests
        loadContestEntries(selectedContestForEntries, entryPage, pageSize);
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
        loadAllDashboardData();
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

  const handlePageSizeChange = (newPageSize) => {
    setListLoading(true);
    if (selectedContestForEntries) setLoadingEntries(true);
    setPageSize(newPageSize);
    setPages({ recipes: 1, tips: 1, contests: 1, announcements: 1, feedback: 1 });
    setEntryPage(1);
  };

  const renderManagementTableState = (items, colSpan, emptyMessage, onRetry) => {
    const hasPage = Boolean(pageMeta[activeTab]);
    if (listError) {
      return <AdminTableState colSpan={colSpan} error={listError} emptyMessage={emptyMessage} onRetry={onRetry} />;
    }
    if (listLoading && !hasPage) {
      return <AdminTableState colSpan={colSpan} loading emptyMessage={emptyMessage} onRetry={onRetry} />;
    }
    if (!listLoading && items.length === 0) {
      return <AdminTableState colSpan={colSpan} emptyMessage={emptyMessage} onRetry={onRetry} />;
    }
    return null;
  };

  const changeManagementPage = (tab, nextPage) => {
    setListLoading(true);
    setPages((current) => ({ ...current, [tab]: nextPage }));
  };

  const renderManagementPagination = (tab, label) => (
    <AdminPagination
      page={pages[tab]}
      pageSize={pageSize}
      totalCount={pageMeta[tab]?.totalCount ?? totalCounts[tab]}
      onPageChange={(nextPage) => changeManagementPage(tab, nextPage)}
      onPageSizeChange={handlePageSizeChange}
      disabled={listLoading}
      label={label}
    />
  );

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
            disabled={loading || listLoading}
          >
            {loading || listLoading ? 'Refreshing…' : 'Refresh'}
          </button>
          {lastUpdated && <span className="small text-muted align-self-center">Updated {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert" style={{ borderRadius: 0 }}>
          <span>{statusMessage.text}</span>
          <button type="button" className="btn-close" onClick={() => setStatusMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <AdminDashboardNav
        activeTab={activeTab}
        totalCounts={totalCounts}
        onTabChange={(key) => {
          if (key !== 'overview' && key !== 'members') setListLoading(true);
          setActiveTab(key);
          setSelectedContestForEntries(null);
        }}
      />

      {activeTab === 'members' && <AdminMembersPanel />}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          totalCounts={totalCounts}
          overviewCounts={overviewCounts}
          onOpenRecipeModal={() => setShowRecipeModal(true)}
          onOpenTipModal={() => setShowTipModal(true)}
          onOpenContestModal={() => setShowContestModal(true)}
          onOpenAnnouncementModal={handleOpenAnnouncementModal}
        />
      )}

      {/* TAB 2: RECIPES */}
      {activeTab === 'recipes' && (
        <AdminRecipesTab
          recipes={recipes}
          listError={listError}
          onOpenRecipeModal={() => setShowRecipeModal(true)}
          onToggleRecipeFree={handleToggleRecipeFree}
          onDeleteRecipe={handleDeleteRecipe}
          renderManagementTableState={renderManagementTableState}
          renderManagementPagination={renderManagementPagination}
          onReload={() => loadManagementPage('recipes', pages.recipes, pageSize)}
        />
      )}

      {/* TAB 3: COOKING TIPS */}
      {activeTab === 'tips' && (
        <AdminTipsTab
          tips={tips}
          listError={listError}
          onOpenTipModal={() => setShowTipModal(true)}
          onToggleTipFree={handleToggleTipFree}
          onDeleteTip={handleDeleteTip}
          renderManagementTableState={renderManagementTableState}
          renderManagementPagination={renderManagementPagination}
          onReload={() => loadManagementPage('tips', pages.tips, pageSize)}
        />
      )}

      {/* TAB 4: CONTESTS */}
      {activeTab === 'contests' && (
        <AdminContestsTab
          contests={contests}
          selectedContestForEntries={selectedContestForEntries}
          setSelectedContestForEntries={setSelectedContestForEntries}
          contestEntries={contestEntries}
          loadingEntries={loadingEntries}
          entryError={entryError}
          entryMeta={entryMeta}
          entryPage={entryPage}
          setEntryPage={setEntryPage}
          pageSize={pageSize}
          handlePageSizeChange={handlePageSizeChange}
          listError={listError}
          onOpenContestModal={() => setShowContestModal(true)}
          onViewEntries={handleViewEntries}
          onDeleteContest={handleDeleteContest}
          onSelectWinner={handleSelectWinner}
          loadContestEntries={loadContestEntries}
          renderManagementTableState={renderManagementTableState}
          renderManagementPagination={renderManagementPagination}
          onReload={() => loadManagementPage('contests', pages.contests, pageSize)}
        />
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <AdminAnnouncementsTab
          announcements={announcements}
          listError={listError}
          onOpenAnnouncementModal={handleOpenAnnouncementModal}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          renderManagementTableState={renderManagementTableState}
          renderManagementPagination={renderManagementPagination}
          onReload={() => loadManagementPage('announcements', pages.announcements, pageSize)}
        />
      )}

      {/* TAB 6: FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <AdminFeedbackTab
          filteredFeedbacks={filteredFeedbacks}
          feedbackFilter={feedbackFilter}
          setFeedbackFilter={setFeedbackFilter}
          setListLoading={setListLoading}
          setPages={setPages}
          totalCounts={totalCounts}
          overviewCounts={overviewCounts}
          pageSize={pageSize}
          pages={pages}
          listError={listError}
          onDeleteFeedback={handleDeleteFeedback}
          renderManagementTableState={renderManagementTableState}
          renderManagementPagination={renderManagementPagination}
          loadManagementPage={loadManagementPage}
        />
      )}

      {/* MODALS */}
      <AdminRecipeModal
        show={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSubmit={handleCreateRecipe}
        recipeForm={recipeForm}
        setRecipeForm={setRecipeForm}
        categories={categories}
        savingRecipe={savingRecipe}
      />
      <AdminTipModal
        show={showTipModal}
        onClose={() => setShowTipModal(false)}
        onSubmit={handleCreateTip}
        tipForm={tipForm}
        setTipForm={setTipForm}
        categories={categories}
      />
      <AdminContestModal
        show={showContestModal}
        onClose={() => setShowContestModal(false)}
        onSubmit={handleCreateContest}
        contestForm={contestForm}
        setContestForm={setContestForm}
      />
      <AdminAnnouncementModal
        show={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSubmit={handleCreateAnnouncement}
        announcementForm={announcementForm}
        setAnnouncementForm={setAnnouncementForm}
        announcementContests={announcementContests}
      />
    </div>
  );
};

export default AdminDashboardPage;

