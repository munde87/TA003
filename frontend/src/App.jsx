import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerProfile from './pages/OwnerProfile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
    const { user, loading } = useAuth();
    const { isDark } = useTheme();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#f5a623]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/auth"
                    element={user ? <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/dashboard'} /> : <AuthPage />}
                />
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/owner/dashboard"
                    element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/owner/profile"
                    element={<ProtectedRoute role="owner"><OwnerProfile /></ProtectedRoute>}
                />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDark ? 'dark' : 'light'}
                toastStyle={{
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    border: '1px solid var(--border)',
                }}
            />
        </div>
    );
}

export default App;