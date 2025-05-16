import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css';
import './index.css';
import Login from "./Pages/Login";
import SignUpPage from "./Pages/Registration";
import LeaderboardPage from "./Pages/LeaderboardPage";
import WellnessPage from "./Pages/WellnessPage";
import StudyRoom from "./Pages/StudyRoom";
import StudyChatbox from "./Pages/StudyChatbox"; 
import Calendar from "./Pages/CalendarPage"
import Timerp from "./Pages/Timerpage"
import Flashcardspage from "./Pages/Flashcardspage";
import DashboardPage from "./Pages/DashboardPage";
import ProfilePage from "./Pages/ProfilePage";
import Registration from "./Pages/Registration";
import ModulePage from "./components/ModulePage"
import { UserProvider } from './components/UserContext'; 
import FriendsListPage from './Pages/FriendsListPage';
import BlockListPage from './Pages/BlockListPage';
import LandingPage from "./Pages/LandingPage";
import ApiDocs from "./Pages/ApiDocs";
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './Pages/ForgotPassword';

import { ThemeProvider } from './components/ThemeProvider'; 
import LessonPage from "./components/LessonPage";

// Layout wrapper component that conditionally applies different styles
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  // Apply different classes based on the current route
  return (
    <div className={isLandingPage ? 'min-h-screen w-full' : 'flex justify-center items-center h-screen'}>
      {children}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <LayoutWrapper>
          <Routes>
            {/* Set LandingPage as the default route */}
            <Route path="/" element={<LandingPage />} />           
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/wellness" element={<WellnessPage />} />
            <Route path="/studyroom" element={<StudyRoom />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/timer" element={<Timerp />} />
            <Route path="/flashcards" element={<Flashcardspage />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/modules" element={<PrivateRoute><ModulePage /></PrivateRoute>} />
            <Route path="/lesson" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/friends" element={<PrivateRoute><FriendsListPage /></PrivateRoute>} />
            <Route path="/block" element={<PrivateRoute><BlockListPage /></PrivateRoute>} />
            <Route path="/techniques" element={<PrivateRoute><StudyChatbox /></PrivateRoute>} />
            <Route path="/registration" element={<Registration />}/>
            <Route path="/api" element={<ApiDocs />} />
          </Routes>
        </LayoutWrapper>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;