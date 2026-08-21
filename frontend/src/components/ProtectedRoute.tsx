import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";
import { LoadingSpinner } from "./StatePanels";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Loading ECMVS..." />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleRoute({ allowed, children }: { allowed: Role[]; children: ReactNode }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowed.includes(currentUser.role)) {
    return (
      <div className="state-panel">
        <div className="empty-icon">🔒</div>
        <h4>Access restricted</h4>
        <p>Your role ({currentUser.role}) does not have permission to view this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}
