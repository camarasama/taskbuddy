import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister'; // NEW
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Parent Pages
import AddFamilyMember from './pages/parent/AddFamilyMember'; // NEW

// Placeholder components for dashboards (will be created later)
const ParentDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Parent Dashboard</h1></div>;
const ChildDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Child Dashboard</h1></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Dashboard</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* NEW: Admin Registration Route (dev-only URL) */}
          <Route path="/admin-registration-secure-2026" element={<AdminRegister />} />

          {/* Protected Routes - Parent */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute requiredRole="parent">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<ParentDashboard />} />
                    {/* NEW: Add Family Member Route */}
                    <Route path="family/:familyId/add-member" element={<AddFamilyMember />} />
                    <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Child */}
          <Route
            path="/child/*"
            element={
              <ProtectedRoute requiredRole="child">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<ChildDashboard />} />
                    <Route path="*" element={<Navigate to="/child/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;