import React from 'react'
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Blog from './pages/Blog';
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './router/PrivateRoute';
import NotFoundPage from './pages/NotFoundPage'
import UserProfile from './pages/UserProfile';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<SignUp />} />
            <Route path="blog/:id" element={<Blog />} />
            <Route path="user-profile/:userName" element={<UserProfile />} />
            <Route element={<PrivateRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>
          </Route>
            <Route element={<PrivateRoute/>}>
            <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="password-reset/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>

  )
}

export default App