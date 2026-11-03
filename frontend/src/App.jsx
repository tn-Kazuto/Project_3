import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { RecipesPage } from './pages/public/RecipesPage';
import { RecipeDetailPage } from './pages/public/RecipeDetailPage';
import { MyRecipesPage } from './pages/member/MyRecipesPage';
import { ContestsPage } from './pages/public/ContestsPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { FeedbackPage } from './pages/public/FeedbackPage';
import { FaqPage } from './pages/public/FaqPage';
import { ProfilePage } from './pages/member/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Phase 5 routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Catalog & Member routes (Phase 6) */}
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="recipes/:id" element={<RecipeDetailPage />} />
            <Route
              path="my-recipes"
              element={
                <ProtectedRoute>
                  <MyRecipesPage />
                </ProtectedRoute>
              }
            />

            {/* Public Community routes (Phase 7) */}
            <Route path="contests" element={<ContestsPage />} />
            <Route path="contests/:id" element={<ContestsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="faqs" element={<FaqPage />} />

            {/* Profile route (Phase 7) */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard route (Phase 8) */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

