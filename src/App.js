import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPageForNormal';
import AdminDashboard from './pages/AdminDashboard';
import NormalDashboard from './pages/NormalDashboard';
import HomePage from './pages/HomePage';  
import EventDetail from './pages/EventDetail';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword'; 
import ContactUs from './pages/ContactUs';
import './App.css';
function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));  

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);  
    }
  }, [userRole]);

  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/homepage" />} />

        {/* Login and Register routes */}
        <Route path="/login" element={<LoginPage setUserRole={setUserRole} />} /> {/* Pass down setUserRole */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/normal-dashboard" element={<NormalDashboard />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/forgot-password" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Conditionally render based on user role */}
        {userRole === 'admin' && (
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        )}
        {userRole === 'normal' && (
          <Route path="/normal-dashboard" element={<NormalDashboard />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
