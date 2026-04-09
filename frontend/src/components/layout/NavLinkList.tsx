import React from "react";
import { NavLink } from "react-router-dom";
import { AGENT_NAV_ITEMS, MAIN_NAV_ITEMS } from "../../lib/navConfig";

type NavLinkListProps = {
  onNavigate?: () => void;
  showIcons?: boolean;
  className?: string;
};

export default function NavLinkList({
  onNavigate,
  showIcons = true,
  className = "",
}: NavLinkListProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item nav-item--row ${isActive ? "active" : ""}`.trim();

  return (
    <nav className={`nav-link-list ${className}`.trim()} aria-label="App sections">
      {MAIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === "/workspace"} onClick={() => onNavigate?.()}>
            {showIcons ? <Icon className="nav-item-icon" size={18} strokeWidth={2} aria-hidden /> : null}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
      <div className="sidebar-nav-section" role="group" aria-label="Research agents">
        <p className="nav-section-label">Agents</p>
        {AGENT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => onNavigate?.()}>
              {showIcons ? <Icon className="nav-item-icon" size={18} strokeWidth={2} aria-hidden /> : null}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
