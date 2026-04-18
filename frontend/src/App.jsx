import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Feed from "./pages/citizen/Feed";
import Explore from "./pages/citizen/Explore";
import CreateIssue from "./pages/citizen/CreateIssue";
import CitizenIssuePage from "./pages/citizen/CitizenIssuePage";

import AdminFeed from "./pages/admin/AdminFeed";
import AdminIssuePage from "./pages/admin/AdminIssuePage";

import Navbar from "./components/Navbar";
import AlertsPage from "./pages/AlertsPage";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const authPages = ["/login", "/signup"];
  const showNavbar = user && !authPages.includes(location.pathname);

  if (loading) return null;

  return (
    <div className="app-shell">
      {showNavbar && <Navbar />}

      <Routes>
        {/* AUTH */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.isAdmin ? "/admin" : "/feed"} />
              : <Login />
          }
        />

        <Route
          path="/signup"
          element={
            user
              ? <Navigate to={user.isAdmin ? "/admin" : "/feed"} />
              : <Signup />
          }
        />

        {/* CITIZEN */}
        <Route
          path="/feed"
          element={<ProtectedRoute><Feed /></ProtectedRoute>}
        />

        <Route
          path="/explore"
          element={<ProtectedRoute><Explore /></ProtectedRoute>}
        />

        <Route
          path="/create-issue"
          element={<ProtectedRoute><CreateIssue /></ProtectedRoute>}
        />

        {/* 🔥 CITIZEN ISSUE DETAILS */}
        <Route
          path="/issues/:issueId"
          element={<ProtectedRoute><CitizenIssuePage /></ProtectedRoute>}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminFeed /></ProtectedRoute>}
        />

        <Route
          path="/admin/issues/:issueId"
          element={<ProtectedRoute adminOnly><AdminIssuePage /></ProtectedRoute>}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        <Route
          path="/profile/edit"
          element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
        />

        {/* ALERTS */}
        <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        }
        />


        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={user?.isAdmin ? "/admin" : "/feed"} />}
        />
      </Routes>
    </div>
  );
}

export default App;
