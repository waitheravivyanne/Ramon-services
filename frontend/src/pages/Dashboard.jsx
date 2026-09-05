import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">

      {/* Dashboard Header */}
      <div className="dashboard-header">

        <h1>
          Welcome, {user.name}! 👋
        </h1>

        <p>
          Welcome to your Ramon's Marketplace dashboard.
        </p>

      </div>


      {/* Dashboard Cards */}
      <div className="dashboard-cards">

        {/* ============================= */}
        {/* BOOK A SERVICE */}
        {/* ============================= */}

        <Link
          to="/services"
          className="dashboard-card"
        >

          <h2>🧹</h2>

          <h3>
            Book a Service
          </h3>

          <p>
            Find and book a professional service.
          </p>

          <span className="dashboard-card-action">
            Browse Services →
          </span>

        </Link>


        {/* ============================= */}
        {/* MY BOOKINGS */}
        {/* ============================= */}

        <Link
          to="/bookings"
          className="dashboard-card"
        >

          <h2>📋</h2>

          <h3>
            My Bookings
          </h3>

          <p>
            View your current and previous bookings.
          </p>

          <span className="dashboard-card-action">
            View Bookings →
          </span>

        </Link>


        {/* ============================= */}
        {/* MY PROFILE */}
        {/* ============================= */}

        <Link
          to="/profile"
          className="dashboard-card"
        >

          <h2>👤</h2>

          <h3>
            My Profile
          </h3>

          <p>
            Manage your account information.
          </p>

          <span className="dashboard-card-action">
            View Profile →
          </span>

        </Link>

      </div>

    </div>
  );
}

export default Dashboard;