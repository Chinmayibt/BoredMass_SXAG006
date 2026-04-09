import React from "react";
import { Link } from "react-router-dom";
import NavLinkList from "./NavLinkList";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="brand brand-link">
        <div className="brand-mark">M</div>
        <div>
          <p className="brand-title">Mantis</p>
          <p className="brand-subtitle">Research intelligence</p>
        </div>
      </Link>

      <NavLinkList />

      <div className="sidebar-footer">
        <p className="muted">Workspace</p>
        <p className="project-name">Autonomous runs</p>
      </div>
    </aside>
  );
}
