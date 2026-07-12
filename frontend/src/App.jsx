import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SleepTracker from './pages/SleepTracker';
import NutritionTracker from './pages/NutritionTracker';
import SymptomChecker from './pages/SymptomChecker';
import MoodTracker from './pages/MoodTracker';
import ActivityTracker from './pages/ActivityTracker';
import SkinTracker from './pages/SkinTracker';
import ToolsPage from './pages/ToolsPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import DailyCheckIn from './pages/DailyCheckIn';
import AchievementsPage from './pages/AchievementsPage';
import AIAssistant from './pages/AIAssistant';
import InsightsPage from './pages/InsightsPage';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuthContext();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isLoggedIn } = useAuthContext();
  return !isLoggedIn ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                element={<Dashboard />} />
        <Route path="checkin"       element={<DailyCheckIn />} />
        <Route path="sleep"         element={<SleepTracker />} />
        <Route path="nutrition"     element={<NutritionTracker />} />
        <Route path="activity"      element={<ActivityTracker />} />
        <Route path="symptoms"      element={<SymptomChecker />} />
        <Route path="mood"          element={<MoodTracker />} />
        <Route path="skin"          element={<SkinTracker />} />
        <Route path="tools"         element={<ToolsPage />} />
        <Route path="insights"      element={<InsightsPage />} />
        <Route path="achievements"  element={<AchievementsPage />} />
        <Route path="ai"            element={<AIAssistant />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
