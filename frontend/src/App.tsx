import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppShell from "./components/layout/AppShell";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DebateAgent from "./pages/DebateAgent";
import RoadmapAgent from "./pages/RoadmapAgent";
import PodcastAgent from "./pages/PodcastAgent";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppShell />}>
          <Route path="/workspace" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/debate" element={<DebateAgent />} />
          <Route path="/roadmap" element={<RoadmapAgent />} />
          <Route path="/podcast" element={<PodcastAgent />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
