import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on home, login and register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();

    // Return user to home page after logout
    navigate("/", { replace: true });
  };

  // Get the user's role safely
  const userRole = String(user?.role || "").toLowerCase();

  return (
    <nav className="navbar">

      {/* =========================
          LOGO
      ========================== */}
      <Link to="/" className="logo">
        Ramon's Marketplace
      </Link>

      {/* =========================
          NAVIGATION
      ========================== */}
      <div className="nav-links">

        {/* HOME */}
        <Link
          to="/"
          className={`nav-link ${
            location.pathname === "/" ? "active" : ""
          }`}
        >
          🏠 Home
        </Link>

        {/* SERVICES */}
        <Link
          to="/services"
          className={`nav-link ${
            location.pathname.startsWith("/services") ? "active" : ""
          }`}
        >
          🛠️ Services
        </Link>

        {/* =========================
            USER IS LOGGED IN
        ========================== */}
        {user ? (
          <>
            {/* USER NAME */}
            <span className="welcome-user">
              Welcome, {user.name || "Client"}
            </span>

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              📊 Dashboard
            </Link>

            {/* BOOKINGS */}
            <Link
              to="/bookings"
              className={`nav-link booking-link ${
                location.pathname === "/bookings" ? "active" : ""
              }`}
            >
              📅 My Bookings
            </Link>

            {/* PROFILE */}
            <Link
              to="/profile"
              className={`nav-link profile-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              👤 Profile
            </Link>

            {/* ADMIN */}
            {userRole === "admin" && (
              <Link
                to="/admin"
                className={`nav-link admin-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                ⚙️ Admin Dashboard
              </Link>
            )}

            {/* LOGOUT */}
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          /* =========================
             USER NOT LOGGED IN
          ========================== */
          <>
            {/* LOGIN */}
            <Link
              to="/login"
              className="nav-link login-link"
            >
              🔐 Login
            </Link>

            {/* REGISTER */}
            <Link
              to="/register"
              className="nav-link register-link"
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