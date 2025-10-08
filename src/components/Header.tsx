import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { useState, useEffect } from "react";
import "./Header.css";

export const Header = () => {
  const { token, logout } = useAuthContext();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    document.body.className = isDark ? "dark" : "light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="app-header">
      <Link to="/search" className="app-logo-link">
        <span className="app-logo-text">Spoty</span>
      </Link>
      <nav className="app-nav">
        {token && (
          <>
            <Link to="/search" className="nav-link">
              Buscar
            </Link>
            <Link to="/albums" className="nav-link">
              My Albums
            </Link>
            <span className="separator">|</span>
            <button onClick={handleLogout} className="nav-button">
              Cerrar Sesión
            </button>
            <span className="separator">|</span>
            <button onClick={toggleTheme} className="nav-button theme-toggle">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
