import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();  

  if (loading) return <Loader />;

  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/explore" />;
  }
  return children;
};
