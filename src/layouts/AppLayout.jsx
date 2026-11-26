import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { navigation } from "../utils/navigation";
import { PulseMark } from "../components/Pulse";
import Avatar from "../components/Avatar";
import { capitalize } from "../utils/format";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const items = navigation[user.role] || [];

  useEffect(() => setOpen(false), [location.pathname]); // close the mobile menu after navigating

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <PulseMark />
          <div>
            <strong>Northgate HMS</strong>
            <span>{capitalize(user.role)} area</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav>
          <ul>
            {items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="sidebar-note">Learning project. Fictional data only; not a certified clinical system.</p>
      </aside>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="main-column">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbar-user">
            <Avatar name={user.full_name} />
            <div className="topbar-user-text">
              <strong>{user.full_name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" /> Log out
            </button>
          </div>
        </header>
        <main id="main" className="content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
