import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use the logout function from useAuth
    logout();

    // Return the client to the home page
    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link
        to="/"
        className="logo"
      >
        Ramon's Marketplace
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/services">
          Services
        </Link>

        {user ? (
          <>
            {/* Welcome message */}
            <span className="welcome-user">
              Welcome, {user.name}
            </span>

            {/* Customer links */}
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/bookings">
              My Bookings
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            {/* Admin link */}
            {user.role?.toLowerCase() === "admin" && (
              <Link to="/admin">
                Admin Dashboard
              </Link>
            )}

            {/* Logout */}
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
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;