import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on home, login and register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const userRole = String(user?.role || "").toLowerCase();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">

      {/* =========================================
          LOGO
      ========================================= */}
      <Link to="/" className="logo" onClick={closeMenu}>
        Ramon's Marketplace
      </Link>


      {/* =========================================
          DESKTOP NAVIGATION
      ========================================= */}
      <div className="nav-links desktop-nav">

        <Link
          to="/"
          className={`nav-link ${
            location.pathname === "/" ? "active" : ""
          }`}
        >
          🏠 Home
        </Link>

        <Link
          to="/services"
          className={`nav-link ${
            location.pathname.startsWith("/services") ? "active" : ""
          }`}
        >
          🛠️ Services
        </Link>

        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              📊 Dashboard
            </Link>

            <Link
              to="/bookings"
              className={`nav-link ${
                location.pathname === "/bookings" ? "active" : ""
              }`}
            >
              📅 My Bookings
            </Link>

            <Link
              to="/profile"
              className={`nav-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              👤 Profile
            </Link>

            {userRole === "admin" && (
              <Link
                to="/admin"
                className={`nav-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                ⚙️ Admin Dashboard
              </Link>
            )}

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              🔐 Login
            </Link>

            <Link to="/register" className="nav-link">
              📝 Register
            </Link>
          </>
        )}
      </div>


      {/* =========================================
          WELCOME + HAMBURGER AREA
          WELCOME IS OUTSIDE THE DROPDOWN
      ========================================= */}
      <div className="navbar-user-area">

        {user && (
          <span className="welcome-user">
            Welcome, {user.name || "Client"}
          </span>
        )}

        <button
          type="button"
          className={`hamburger-button ${
            menuOpen ? "open" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>


      {/* =========================================
          MOBILE DROPDOWN
      ========================================= */}
      <div
        className={`mobile-menu ${
          menuOpen ? "show" : ""
        }`}
      >

        <Link
          to="/"
          className={`mobile-nav-link ${
            location.pathname === "/" ? "active" : ""
          }`}
          onClick={closeMenu}
        >
          🏠 Home
        </Link>

        <Link
          to="/services"
          className={`mobile-nav-link ${
            location.pathname.startsWith("/services")
              ? "active"
              : ""
          }`}
          onClick={closeMenu}
        >
          🛠️ Services
        </Link>

        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`mobile-nav-link ${
                location.pathname === "/dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={closeMenu}
            >
              📊 Dashboard
            </Link>

            <Link
              to="/bookings"
              className={`mobile-nav-link ${
                location.pathname === "/bookings"
                  ? "active"
                  : ""
              }`}
              onClick={closeMenu}
            >
              📅 My Bookings
            </Link>

            <Link
              to="/profile"
              className={`mobile-nav-link ${
                location.pathname === "/profile"
                  ? "active"
                  : ""
              }`}
              onClick={closeMenu}
            >
              👤 Profile
            </Link>

            {userRole === "admin" && (
              <Link
                to="/admin"
                className={`mobile-nav-link ${
                  location.pathname === "/admin"
                    ? "active"
                    : ""
                }`}
                onClick={closeMenu}
              >
                ⚙️ Admin Dashboard
              </Link>
            )}

            <button
              type="button"
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              🔐 Login
            </Link>

            <Link
              to="/register"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              📝 Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;