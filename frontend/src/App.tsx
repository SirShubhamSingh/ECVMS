import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./components/Toast";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorIssues from "./pages/VendorIssues";
import VendorIssueDetails from "./pages/VendorIssueDetails";
import Investigations from "./pages/Investigations";
import InvestigationDetails from "./pages/InvestigationDetails";
import RiskAssessmentPage from "./pages/RiskAssessment";
import Resolutions from "./pages/Resolutions";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import AuditLogPage from "./pages/AuditLogPage";
import Settings from "./pages/Settings";
import ComplianceHub from "./pages/ComplianceHub";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/compliance" element={<ComplianceHub />} />

              <Route path="/vendor-issues" element={<VendorIssues />} />
              <Route path="/vendor-issues/:id" element={<VendorIssueDetails />} />

              <Route
                path="/investigations"
                element={
                  <RoleRoute allowed={["Super Administrator", "Compliance Officer"]}>
                    <Investigations />
                  </RoleRoute>
                }
              />
              <Route
                path="/investigations/:id"
                element={
                  <RoleRoute allowed={["Super Administrator", "Compliance Officer"]}>
                    <InvestigationDetails />
                  </RoleRoute>
                }
              />

              <Route
                path="/risk-assessment"
                element={
                  <RoleRoute allowed={["Super Administrator", "Compliance Officer", "Vendor Manager"]}>
                    <RiskAssessmentPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/resolutions"
                element={
                  <RoleRoute allowed={["Super Administrator", "Compliance Officer", "Approver"]}>
                    <Resolutions />
                  </RoleRoute>
                }
              />

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />

              <Route
                path="/users"
                element={
                  <RoleRoute allowed={["Super Administrator"]}>
                    <Users />
                  </RoleRoute>
                }
              />
              <Route
                path="/audit-log"
                element={
                  <RoleRoute allowed={["Super Administrator"]}>
                    <AuditLogPage />
                  </RoleRoute>
                }
              />

              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
