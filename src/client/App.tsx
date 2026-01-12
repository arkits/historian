import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { AboutPage } from "@/pages/AboutPage";
import { SupportedServicesPage } from "@/pages/SupportedServicesPage";
import { DocsPage } from "@/pages/DocsPage";
import { DocsGettingStartedPage } from "@/pages/DocsGettingStartedPage";
import { DocsSupportedServicesPage } from "@/pages/DocsSupportedServicesPage";
import { DocsApiPage } from "@/pages/DocsApiPage";
import { DocsSelfHostingPage } from "@/pages/DocsSelfHostingPage";
import { Dashboard } from "@/pages/Dashboard";
import { HistoryPage } from "@/pages/HistoryPage";
import { HistoryDetailPage } from "@/pages/HistoryDetailPage";
import { ImportPage } from "@/pages/ImportPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ConnectionsPage } from "@/pages/ConnectionsPage";
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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/supported-services" element={<SupportedServicesPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route
          path="/docs/getting-started"
          element={<DocsGettingStartedPage />}
        />
        <Route
          path="/docs/supported-services"
          element={<DocsSupportedServicesPage />}
        />
        <Route path="/docs/api" element={<DocsApiPage />} />
        <Route path="/docs/self-hosting" element={<DocsSelfHostingPage />} />
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
              <HistoryPage onSignOut={handleSignOut} />
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
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <ConnectionsPage onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
