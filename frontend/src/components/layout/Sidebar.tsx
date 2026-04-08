import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

const agentNavItems = [
  { label: "Debate agent", to: "/debate" },
  { label: "Roadmap agent", to: "/roadmap" },
  { label: "Podcast agent", to: "/podcast" },
];

type SidebarProps = {
  active?: string;
};

export default function Sidebar({ active = "Home" }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <p className="brand-title">ScholAR</p>
          <p className="brand-subtitle">Research Workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive || active === item.label ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-nav-section" role="group" aria-label="Research agents">
          <p className="nav-section-label">Agents</p>
          {agentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive || active === item.label ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <p className="muted">Workspace mode</p>
        <p className="project-name">Autonomous</p>
      </div>
    </aside>
  );
}
