import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Sidebar from "./components/layout/Sidebar";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DebateAgent from "./pages/DebateAgent";
import RoadmapAgent from "./pages/RoadmapAgent";
import PodcastAgent from "./pages/PodcastAgent";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/debate" element={<DebateAgent />} />
          <Route path="/roadmap" element={<RoadmapAgent />} />
          <Route path="/podcast" element={<PodcastAgent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
