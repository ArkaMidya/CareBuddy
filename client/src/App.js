import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container, ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import healthcareTheme from './theme/healthcareTheme';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ReportsPage from './pages/ReportsPage';
import ConsultationsPage from './pages/ConsultationsPage';
import EducationPage from './pages/EducationPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import ProfilePage from './pages/ProfilePage';
import HealthReportPage from './pages/HealthReportPage';
import FeedbackReferralPage from './pages/FeedbackReferralPage';
import NotFoundPage from './pages/NotFoundPage';
import ManageUsersPage from './pages/ManageUsersPage';
import NotificationsPage from './pages/NotificationsPage';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={healthcareTheme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            position: 'relative',
                    '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/bglogo.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          zIndex: -1,
        },
          }}>
            <Header />
            
            <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
              <Container maxWidth="xl">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/consultations" element={
                    <ProtectedRoute>
                      <ConsultationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/health-reports" element={
                    <ProtectedRoute>
                      <HealthReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/feedback-referrals" element={
                    <ProtectedRoute>
                      <FeedbackReferralPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/manage-users" element={
                    <ProtectedRoute>
                      <ManageUsersPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Container>
            </Box>
            
            <Footer />
          </Box>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
