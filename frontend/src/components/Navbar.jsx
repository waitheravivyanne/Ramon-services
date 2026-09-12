import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  const handleBack = () => {
    // Don't go back if the user is already on the home page
    if (location.pathname === "/") {
      return;
    }

    navigate(-1);
  };

  const handleLogout = () => {
    logout();

    // Make sure the user is returned to the home page
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
        <Link to="/" className="nav-link">
          🏠 Home
        </Link>

        {/* SERVICES */}
        <Link to="/services" className="nav-link">
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

            {/* BACK */}
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
              disabled={location.pathname === "/"}
            >
              ← Back
            </button>

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className="nav-link"
            >
              📊 Dashboard
            </Link>

            {/* BOOKINGS */}
            <Link
              to="/bookings"
              className="nav-link booking-link"
            >
              📅 My Bookings
            </Link>

            {/* PROFILE */}
            <Link
              to="/profile"
              className="nav-link profile-link"
            >
              👤 Profile
            </Link>

            {/* ADMIN */}
            {userRole === "admin" && (
              <Link
                to="/admin"
                className="nav-link admin-link"
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
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
              disabled={location.pathname === "/"}
            >
              ← Back
            </button>

            <Link
              to="/login"
              className="nav-link"
            >
              🔐 Login
            </Link>

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