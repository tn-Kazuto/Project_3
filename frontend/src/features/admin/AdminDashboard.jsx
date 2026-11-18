import React, { useEffect } from 'react';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { AdminHeader } from './components/AdminHeader';
import { AdminNavTabs } from './components/AdminNavTabs';
import { AdminOverviewTab } from './components/AdminOverviewTab';
import { AdminRecipesTab } from './components/AdminRecipesTab';
import { AdminTipsTab } from './components/AdminTipsTab';
import { AdminContestsTab } from './components/AdminContestsTab';
import { AdminAnnouncementsTab } from './components/AdminAnnouncementsTab';
import { AdminFeedbackTab } from './components/AdminFeedbackTab';
import { AdminRecipeModal } from './components/modals/AdminRecipeModal';
import { AdminTipModal } from './components/modals/AdminTipModal';
import { AdminContestModal } from './components/modals/AdminContestModal';
import { AdminAnnouncementModal } from './components/modals/AdminAnnouncementModal';

export const AdminDashboard = () => {
  const {
    activeTab,
    setActiveTab,
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
  } = useAdminDashboard();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="container-fluid py-4 px-md-5 luxury-admin">
      {/* 1. Header & Status message */}
      <AdminHeader
        loadAllDashboardData={loadAllDashboardData}
        statusMessage={statusMessage}
        setStatusMessage={setStatusMessage}
      />

      {/* 2. Navigation Tabs */}
      <AdminNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedContestForEntries={setSelectedContestForEntries}
        recipesCount={recipes.length}
        tipsCount={tips.length}
        contestsCount={contests.length}
        announcementsCount={announcements.length}
        feedbacksCount={feedbacks.length}
      />

      {/* 3. Tab Contents */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          recipes={recipes}
          tips={tips}
          contests={contests}
          feedbacks={feedbacks}
          setShowRecipeModal={setShowRecipeModal}
          setShowTipModal={setShowTipModal}
          setShowContestModal={setShowContestModal}
          setShowAnnouncementModal={setShowAnnouncementModal}
        />
      )}

      {activeTab === 'recipes' && (
        <AdminRecipesTab
          recipes={recipes}
          setShowRecipeModal={setShowRecipeModal}
          handleToggleRecipeFree={handleToggleRecipeFree}
          handleDeleteRecipe={handleDeleteRecipe}
        />
      )}

      {activeTab === 'tips' && (
        <AdminTipsTab
          tips={tips}
          setShowTipModal={setShowTipModal}
          handleToggleTipFree={handleToggleTipFree}
          handleDeleteTip={handleDeleteTip}
        />
      )}

      {activeTab === 'contests' && (
        <AdminContestsTab
          contests={contests}
          selectedContestForEntries={selectedContestForEntries}
          setSelectedContestForEntries={setSelectedContestForEntries}
          contestEntries={contestEntries}
          loadingEntries={loadingEntries}
          setShowContestModal={setShowContestModal}
          handleViewEntries={handleViewEntries}
          handleDeleteContest={handleDeleteContest}
          handleSelectWinner={handleSelectWinner}
        />
      )}

      {activeTab === 'announcements' && (
        <AdminAnnouncementsTab
          announcements={announcements}
          setShowAnnouncementModal={setShowAnnouncementModal}
          handleDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {activeTab === 'feedback' && (
        <AdminFeedbackTab
          feedbacks={feedbacks}
          filteredFeedbacks={filteredFeedbacks}
          feedbackFilter={feedbackFilter}
          setFeedbackFilter={setFeedbackFilter}
          handleDeleteFeedback={handleDeleteFeedback}
        />
      )}

      {/* 4. Action Modals */}
      <AdminRecipeModal
        show={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSubmit={handleCreateRecipe}
        recipeForm={recipeForm}
        setRecipeForm={setRecipeForm}
        categories={categories}
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
        contests={contests}
      />
    </div>
  );
};

export default AdminDashboard;
