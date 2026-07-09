import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StreakProvider } from './contexts/StreakContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import BadgeUnlockModal from './components/gamification/BadgeUnlockModal';
import ChatbotIcon from './components/chat/ChatbotIcon';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BMIPage from './pages/BMIPage';
import WaterTrackerPage from './pages/WaterTrackerPage';
import MedicationsPage from './pages/MedicationsPage';
import WorkoutPage from './pages/WorkoutPage';
import MenstruationPage from './pages/MenstruationPage';
import MentalWellnessPage from './pages/MentalWellnessPage';
import ReportDecoderPage from './pages/ReportDecoderPage';
import AchievementsPage from './pages/AchievementsPage';
import HabitTrackerPage from './pages/HabitTrackerPage';
import NearbyHospitalsPage from './pages/NearbyHospitalsPage';
import LiveDeploymentPage from './pages/LiveDeploymentPage';
import AIMoodCompanionPage from './pages/AIMoodCompanionPage';
import AIAssistantPage from './pages/AIAssistantPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <>
      <Routes>
        {/* Public — Landing page (home) */}
        <Route
          path="/"
          element={
            isLoading ? null : user ? <Navigate to="/dashboard" replace /> : <LandingPage />
          }
        />

        {/* Public — Login / Signup */}
        <Route
          path="/login"
          element={
            isLoading ? null : user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bmi" element={<ProtectedRoute><BMIPage /></ProtectedRoute>} />
        <Route path="/water-tracker" element={<ProtectedRoute><WaterTrackerPage /></ProtectedRoute>} />
        <Route path="/medications" element={<ProtectedRoute><MedicationsPage /></ProtectedRoute>} />
        <Route path="/workout" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
        <Route path="/menstruation" element={<ProtectedRoute><MenstruationPage /></ProtectedRoute>} />
        <Route path="/mental-health" element={<ProtectedRoute><MentalWellnessPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportDecoderPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/habit-tracker" element={<ProtectedRoute><HabitTrackerPage /></ProtectedRoute>} />
        <Route path="/nearby" element={<ProtectedRoute><NearbyHospitalsPage /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
        <Route path="/ai-mood-companion" element={<ProtectedRoute><AIMoodCompanionPage /></ProtectedRoute>} />
        <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContactsPage /></ProtectedRoute>} />

        {/* Public */}
        <Route path="/deployment" element={<LiveDeploymentPage />} />

        {/* Catch-all → redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global floating elements — only show when user is logged in */}
      {user && <ChatbotIcon />}
      <BadgeUnlockModal />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StreakProvider>
            <AppRoutes />
          </StreakProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
