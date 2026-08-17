import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="h-10 w-10 rounded-full border-2 border-[#5B21B6] border-t-transparent animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
