import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { Dashboard } from "@/pages/Dashboard";
import { HistoryPage } from "@/pages/HistoryPage";
import { HistoryDetailPage } from "@/pages/HistoryDetailPage";
import { ImportPage } from "@/pages/ImportPage";
import { SettingsPage } from "@/pages/SettingsPage";
import "./index.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = trpc.getSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthCallback({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { data: session, isLoading } = trpc.getSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (session?.session) {
      onAuthSuccess();
    }
  }, [session, onAuthSuccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Navigate to="/dashboard" replace />;
}

export function App() {
  const [signOutKey, setSignOutKey] = useState(0);

  const handleSignOut = () => {
    setSignOutKey((prev) => prev + 1);
  };

  return (
    <BrowserRouter key={signOutKey}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <HistoryDetailPage onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <ImportPage onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
