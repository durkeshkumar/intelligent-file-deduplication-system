import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Files from "../pages/Files";
import FileDetails from "../pages/FileDetails";
import Duplicates from "../pages/Duplicates";
import DuplicateGroupDetails from "../pages/DuplicateGroupDetails";
import DeletionHistory from "../pages/DeletionHistory";
import AuditLogs from "../pages/AuditLogs";
import Analytics from "../pages/Analytics";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef4f8",
          color: "#16324a",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Files */}
          <Route
            path="/files"
            element={<Files />}
          />

          <Route
            path="/files/:id"
            element={<FileDetails />}
          />

          {/* Duplicate Files */}
          <Route
            path="/duplicates"
            element={<Duplicates />}
          />

          <Route
            path="/duplicate-groups/:id"
            element={
              <DuplicateGroupDetails />
            }
          />

          {/* Deletion History */}
          <Route
            path="/deletion-history"
            element={
              <DeletionHistory />
            }
          />

          {/* Audit Logs */}
          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

          {/* Storage Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* Unknown protected route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected Application */}
      <Route
        path="/*"
        element={<ProtectedLayout />}
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}