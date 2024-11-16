import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FourOFour from './components/404/FourOFour';
import { initialize } from './utils/reactGA';
import { AuthProvider } from './components/Authentication/AuthContext';
import PrivateRoute from './components/Authentication/PrivateRoute';

const NavBar = lazy(() => import('./components/Navbar/Navbar'));
const Home = lazy(() => import('./pages/Home/Home'));
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage')); // Import the Landing Page
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const UserDashboard = lazy(() => import('./pages/UserDashboard/UserDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard/StaffDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));

const App = () => {
  initialize();
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <NavBar />
          <div className="main-content">
            <Routes>
              {/* Landing Page Route */}
              <Route path="/" element={<LandingPage />} /> {/* Publicly accessible landing page */}

              {/* Protected Home Route */}
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/user-dashboard"
                element={
                  <PrivateRoute requiredRole="user">
                    <UserDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/staff-dashboard"
                element={
                  <PrivateRoute requiredRole="staff">
                    <StaffDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<FourOFour />} />
            </Routes>
          </div>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
