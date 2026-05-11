import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/User/Dashboard';
import Bookings from './pages/User/Bookings';
import Catalog from './pages/User/Catalog';
import ResourceDetail from './pages/User/ResourceDetail';
import ResourceScheduler from './pages/User/ResourceScheduler';
import ResourceSchedule from './pages/User/ResourceSchedule';
import BookingRequest from './pages/User/BookingRequest';
import Chat from './pages/User/Chat';
import Settings from './pages/User/Settings';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import BookingManagement from './pages/Admin/BookingManagement';
import ResourceManagement from './pages/Admin/ResourceManagement';
import UserManagement from './pages/Admin/UserManagement';
import Reports from './pages/Admin/Reports';
import MaintenanceDashboard from './pages/Admin/MaintenanceDashboard';
import AdminSettings from './pages/Admin/Settings';
import AdminMessages from './pages/Admin/Messages';
import MaintenanceLayout from './layouts/MaintenanceLayout';
import MaintenanceMessages from './pages/Maintenance/Messages';
import MyTasks from './pages/Maintenance/MyTasks';
import StaffDashboard from './pages/Maintenance/Dashboard';
import MaintenanceSettings from './pages/Maintenance/Settings';
import MaintenanceDashboardPage from './pages/Admin/MaintenanceDashboard'; // Admin View
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="resources" element={<ResourceManagement />} />
              <Route path="maintenance" element={<MaintenanceDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Maintenance Staff Portal Routes */}
            <Route path="/maintenance" element={<MaintenanceLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="messages" element={<MaintenanceMessages />} />
              <Route path="settings" element={<MaintenanceSettings />} />
            </Route>

            {/* User Portal Routes */}
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources/:id/schedule" element={<ResourceScheduler />} />

              <Route path="/resources/:id/book" element={<BookingRequest />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
