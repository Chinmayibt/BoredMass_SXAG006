import React from "react";

const navItems = ["Home", "Projects", "Reports", "Automation", "Settings"];

type SidebarProps = {
  active?: string;
};

export default function Sidebar({ active = "Projects" }: SidebarProps) {
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
          <button
            key={item}
            type="button"
            className={`nav-item ${active === item ? "active" : ""}`}
            aria-current={active === item ? "page" : undefined}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="muted">Active project</p>
        <p className="project-name">Ikigai Labs</p>
      </div>
    </aside>
  );
}
