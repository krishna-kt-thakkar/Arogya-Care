import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StreakProvider } from './contexts/StreakContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import PageTransition from './components/common/PageTransition';
import BadgeUnlockModal from './components/gamification/BadgeUnlockModal';
import ChatbotIcon from './components/chat/ChatbotIcon';
import GlobalThemeSelector from './components/common/GlobalThemeSelector';

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
import WelcomePage from './pages/WelcomePage';
import AIDoctorBookingPage from './pages/AIDoctorBookingPage';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public — Landing page (home) */}
          <Route
            path="/"
            element={
              isLoading ? null : user ? (
                localStorage.getItem('arogya_hasSeenWelcome') ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />
              ) : <PageTransition><LandingPage /></PageTransition>
            }
          />

          {/* Public — Login / Signup */}
          <Route
            path="/login"
            element={
              isLoading ? null : user ? (
                localStorage.getItem('arogya_hasSeenWelcome') ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />
              ) : <PageTransition><LoginPage /></PageTransition>
            }
          />

          {/* Welcome / Onboarding screen */}
          <Route path="/welcome" element={<ProtectedRoute><PageTransition><WelcomePage /></PageTransition></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/bmi" element={<ProtectedRoute><PageTransition><BMIPage /></PageTransition></ProtectedRoute>} />
          <Route path="/water-tracker" element={<ProtectedRoute><PageTransition><WaterTrackerPage /></PageTransition></ProtectedRoute>} />
          <Route path="/medications" element={<ProtectedRoute><PageTransition><MedicationsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><PageTransition><WorkoutPage /></PageTransition></ProtectedRoute>} />
          <Route path="/menstruation" element={<ProtectedRoute><PageTransition><MenstruationPage /></PageTransition></ProtectedRoute>} />
          <Route path="/mental-health" element={<ProtectedRoute><PageTransition><MentalWellnessPage /></PageTransition></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><PageTransition><ReportDecoderPage /></PageTransition></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><PageTransition><AchievementsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/habit-tracker" element={<ProtectedRoute><PageTransition><HabitTrackerPage /></PageTransition></ProtectedRoute>} />
          <Route path="/nearby" element={<ProtectedRoute><PageTransition><NearbyHospitalsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><PageTransition><AIAssistantPage /></PageTransition></ProtectedRoute>} />
          <Route path="/ai-mood-companion" element={<ProtectedRoute><PageTransition><AIMoodCompanionPage /></PageTransition></ProtectedRoute>} />
          <Route path="/emergency-contacts" element={<ProtectedRoute><PageTransition><EmergencyContactsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/doctor-booking" element={<ProtectedRoute><PageTransition><AIDoctorBookingPage /></PageTransition></ProtectedRoute>} />

          {/* Public */}
          <Route path="/deployment" element={<PageTransition><LiveDeploymentPage /></PageTransition>} />

          {/* Catch-all → redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Global floating elements */}
      {user && <ChatbotIcon />}
      <BadgeUnlockModal />
      <GlobalThemeSelector />
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <StreakProvider>
              <AppRoutes />
            </StreakProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
