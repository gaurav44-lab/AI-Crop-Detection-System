import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';

import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import Advisories from './pages/Advisories';
import AdvisoryDetail from './pages/AdvisoryDetail';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Landing from './pages/LandingPage';
import LiveDetection from './pages/LiveDetection';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-crop border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="cropai-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveDetection /></ProtectedRoute>} />
            <Route path="/reports/new" element={<ProtectedRoute><NewReport /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
            <Route path="/advisories" element={<ProtectedRoute><Advisories /></ProtectedRoute>} />
            <Route path="/advisories/:id" element={<ProtectedRoute><AdvisoryDetail /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Router>
        <Toaster position="top-right" toastOptions={{ className: 'dark:bg-card dark:text-card-foreground dark:border dark:border-border' }} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
