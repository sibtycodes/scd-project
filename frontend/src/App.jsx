import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './router/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ValidationDetailPage from './pages/ValidationDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ValidationsPage from './pages/ValidationsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/validations" element={<ValidationsPage />} />
        <Route path="/validations/:id" element={<ValidationDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
