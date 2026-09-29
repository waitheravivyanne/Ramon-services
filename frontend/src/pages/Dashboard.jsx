import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  /* =========================================
     PROTECT DASHBOARD
  ========================================= */

  if (!user) {
    return null;
  }


  /* =========================================
     DISPLAY USER NAME
  ========================================= */

  const displayName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Customer";


  return (
    <div className="dashboard">
    

      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="dashboard-hero">

        {/* =========================================
            HERO CONTENT
        ========================================= */}

        <div className="dashboard-hero-content">

          {/* BRAND */}

          <div className="dashboard-brand">

            <span className="brand-icon">
              ⌂
            </span>

            <div className="brand-text">

              <strong>
                Ramon's
              </strong>

              <span>
                Marketplace
              </span>

            </div>

          </div>


          {/* WELCOME MESSAGE */}

          <h1>
            Welcome, <span>{displayName}!</span> 👋
          </h1>


          <p>
            Welcome to your Ramon's Marketplace dashboard.
          </p>

        </div>


        {/* =========================================
            HERO VISUAL
            CSS GENERATED — NO IMAGE REQUIRED
        ========================================= */}

        <div className="dashboard-hero-image">

          <div className="hero-orange-bg">

            {/* DECORATIVE CIRCLES */}

            <div className="hero-circle circle-one"></div>

            <div className="hero-circle circle-two"></div>

            <div className="hero-circle circle-three"></div>


            {/* HOUSE */}

            <div className="hero-house">
              🏠
            </div>


            {/* SERVICE WORKER */}

            <div className="hero-worker">
              🧑🏾‍🔧
            </div>


            {/* SERVICE TOOLS */}

            <div className="hero-tools">

              <span>
                🧹
              </span>

              <span>
                🔧
              </span>

              <span>
                ⚡
              </span>

              <span>
                🌱
              </span>

            </div>


            {/* SERVICE LABEL */}

            <div className="hero-service-label">

              <strong>
                Trusted Services
              </strong>

              <span>
                At your doorstep
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          DASHBOARD CARDS
      ========================================= */}

      <section className="dashboard-cards">


        {/* =========================================
            BOOK A SERVICE
        ========================================= */}

        <Link
          to="/services"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon">
            🧹
          </div>


          <h2>
            Book a Service
          </h2>


          <p>
            Find and book a professional service
            for your home or business.
          </p>


          <span className="dashboard-card-action">

            Browse Services

            <span>
              →
            </span>

          </span>

        </Link>


        {/* =========================================
            MY BOOKINGS
        ========================================= */}

        <Link
          to="/bookings"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon">
            📋
          </div>


          <h2>
            My Bookings
          </h2>


          <p>
            View your current and previous
            service bookings.
          </p>


          <span className="dashboard-card-action orange-action">

            View Bookings

            <span>
              →
            </span>

          </span>

        </Link>


        {/* =========================================
            MY PROFILE
        ========================================= */}

        <Link
          to="/profile"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon">
            👤
          </div>


          <h2>
            My Profile
          </h2>


          <p>
            Manage your account information
            and personal details.
          </p>


          <span className="dashboard-card-action">

            View Profile

            <span>
              →
            </span>

          </span>

        </Link>

      </section>

    </div>
  );
}

export default Dashboard;
