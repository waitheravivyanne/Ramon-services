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

      <div className="dashboard-header">

        <h1>
          Welcome, {user.name}! 👋
        </h1>

        <p>
          Welcome to your Ramon's Marketplace dashboard.
        </p>

      </div>

      <div className="dashboard-cards">

        {/* Book a Service */}
        <Link to="/services" className="dashboard-card">

          <h2>🧹</h2>

          <h3>
            Book a Service
          </h3>

          <p>
            Find and book a professional service.
          </p>

        </Link>


        {/* My Bookings */}
        <div className="dashboard-card">

          <h2>📋</h2>

          <h3>
            My Bookings
          </h3>

          <p>
            View your current and previous bookings.
          </p>

        </div>


        {/* My Profile */}
        <div className="dashboard-card">

          <h2>👤</h2>

          <h3>
            My Profile
          </h3>

          <p>
            Manage your account information.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;