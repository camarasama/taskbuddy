import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import TaskList from './pages/parent/tasks/TaskList';
import CreateTask from './pages/parent/tasks/CreateTask';
import EditTask from './pages/parent/tasks/EditTask';
import TaskReview from './pages/parent/tasks/ReviewTasks';
import RewardList from './pages/parent/rewards/RewardList';
import CreateReward from './pages/parent/rewards/CreateReward';
import EditReward from './pages/parent/rewards/EditReward';
import RedemptionReview from './pages/parent/rewards/ReviewRedemptions';
import FamilyManagement from './pages/parent/family/FamilyManagement';
import AddFamilyMember from './pages/parent/family/AddFamilyMember';
import Reports from './pages/parent/reports/Reports';

// Child Pages
import ChildDashboard from './pages/child/Dashboard';
import ChildTaskList from './pages/child/tasks/TaskList';
import ChildTaskDetail from './pages/child/tasks/TaskDetails';
import ChildRewardCatalog from './pages/child/rewards/RewardCatalog';
import ChildRewardDetail from './pages/child/rewards/RewardDetails';
import ChildPoints from './pages/child/points/MyPoints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import FamilyManagementAdmin from './pages/admin/FamilyManagement';

// Shared Pages
import NotificationCenter from './pages/notifications/NotificationCenter';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';

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
          <Route path="/admin-registration-secure-2026" element={<AdminRegister />} />

          {/* Protected Routes - Parent */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute requiredRole="parent">
                <MainLayout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="dashboard" element={<ParentDashboard />} />
                    
                    {/* Task Management */}
                    <Route path="tasks" element={<TaskList />} />
                    <Route path="tasks/create" element={<CreateTask />} />
                    <Route path="tasks/edit/:taskId" element={<EditTask />} />
                    <Route path="tasks/review" element={<TaskReview />} />
                    
                    {/* Reward Management */}
                    <Route path="rewards" element={<RewardList />} />
                    <Route path="rewards/create" element={<CreateReward />} />
                    <Route path="rewards/edit/:rewardId" element={<EditReward />} />
                    <Route path="rewards/redemptions" element={<RedemptionReview />} />
                    
                    {/* Family Management */}
                    <Route path="family" element={<FamilyManagement />} />
                    <Route path="family/add" element={<AddFamilyMember />} />
                    
                    {/* Reports */}
                    <Route path="reports" element={<Reports />} />
                    
                    {/* Shared */}
                    <Route path="notifications" element={<NotificationCenter />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/edit" element={<EditProfile />} />
                    
                    {/* Default */}
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
                    {/* Dashboard */}
                    <Route path="dashboard" element={<ChildDashboard />} />
                    
                    {/* Tasks */}
                    <Route path="tasks" element={<ChildTaskList />} />
                    <Route path="tasks/:assignmentId" element={<ChildTaskDetail />} />
                    
                    {/* Rewards */}
                    <Route path="rewards" element={<ChildRewardCatalog />} />
                    <Route path="rewards/:rewardId" element={<ChildRewardDetail />} />
                    
                    {/* Points */}
                    <Route path="points" element={<ChildPoints />} />
                    
                    {/* Shared */}
                    <Route path="notifications" element={<NotificationCenter />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/edit" element={<EditProfile />} />
                    
                    {/* Default */}
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
                    {/* Dashboard */}
                    <Route path="dashboard" element={<AdminDashboard />} />
                    
                    {/* Management */}
                    <Route path="users" element={<UserManagement />} />
                    <Route path="families" element={<FamilyManagementAdmin />} />
                    
                    {/* Shared */}
                    <Route path="notifications" element={<NotificationCenter />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/edit" element={<EditProfile />} />
                    
                    {/* Default */}
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