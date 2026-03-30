/**
 * App.jsx - Root component with routing
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy-load pages for performance
const LandingPage     = lazy(() => import('./pages/LandingPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const WardrobePage    = lazy(() => import('./pages/WardrobePage'));
const OutfitBuilder   = lazy(() => import('./pages/OutfitBuilder'));
const PlannerPage     = lazy(() => import('./pages/PlannerPage'));
const FavoritesPage   = lazy(() => import('./pages/FavoritesPage'));
const TravelPage      = lazy(() => import('./pages/TravelPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const AnalyticsPage   = lazy(() => import('./pages/AnalyticsPage'));

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected routes inside Layout */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="wardrobe"    element={<WardrobePage />} />
          <Route path="outfits"     element={<OutfitBuilder />} />
          <Route path="planner"     element={<PlannerPage />} />
          <Route path="favorites"   element={<FavoritesPage />} />
          <Route path="travel"      element={<TravelPage />} />
          <Route path="analytics"   element={<AnalyticsPage />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#c23df0', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
