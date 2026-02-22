import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import ReportDetail from './pages/ReportDetail';
import MyReports from './pages/MyReports';
import Advisories from './pages/Advisories';
import AdvisoryDetail from './pages/AdvisoryDetail';
import Community from './pages/Community';
import Profile from './pages/Profile';

// Layout
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-forest-300 font-body">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#14532d', color: '#f0fdf4', border: '1px solid #166534', fontFamily: 'DM Sans' },
            success: { iconTheme: { primary: '#4ade80', secondary: '#14532d' } },
            error: { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #991b1b' } }
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<MyReports />} />
            <Route path="/reports/new" element={<NewReport />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/advisories" element={<Advisories />} />
            <Route path="/advisories/:id" element={<AdvisoryDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
