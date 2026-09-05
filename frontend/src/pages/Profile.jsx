import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/profile");

        console.log(
          "PROFILE RESPONSE:",
          response.data
        );

        setProfile(
          response.data.user ||
            response.data
        );
      } catch (err) {
        console.error(
          "FAILED TO LOAD PROFILE:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");

          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-spinner"></div>

          <p>
            Loading your profile...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="profile-page">

        <div className="profile-error">

          <h2>
            Unable to Load Profile
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     USER INFORMATION
  ===================================================== */

  const name =
    profile?.name ||
    "Customer";

  const email =
    profile?.email ||
    "Not provided";

  const phone =
    profile?.phone ||
    profile?.phoneNumber ||
    "Not provided";

  const role =
    profile?.role ||
    "customer";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-header">

          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your account and view your
            booking information.
          </p>

        </div>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="profile-main-card">

          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-name-area">

            <h2>
              {name}
            </h2>

            <p>
              {email}
            </p>

            <span className="profile-role">
              {role}
            </span>

          </div>

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <section className="profile-section">

          <div className="section-heading">

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Your account information
              </p>
            </div>

          </div>

          <div className="profile-info-grid">

            <div className="profile-info-item">

              <span>
                Full Name
              </span>

              <strong>
                {name}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>
                Email Address
              </span>

              <strong>
                {email}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>
                Phone Number
              </span>

              <strong>
                {phone}
              </strong>

            </div>

            <div className="profile-info-item">

              <span>
                Account Type
              </span>

              <strong>
                {role}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            BOOKING AREA
        ================================================= */}

        <section className="profile-section">

          <div className="section-heading">

            <div>
              <h2>
                Your Services
              </h2>

              <p>
                Manage and track your service bookings.
              </p>
            </div>

          </div>

          <div className="profile-actions">

            <button
              type="button"
              className="profile-action-button primary"
              onClick={() =>
                navigate("/bookings")
              }
            >
              <span>📋</span>

              <div>
                <strong>
                  My Bookings
                </strong>

                <small>
                  View your bookings and track their
                  status
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            <button
              type="button"
              className="profile-action-button"
              onClick={() =>
                navigate("/services")
              }
            >
              <span>🔧</span>

              <div>
                <strong>
                  Book a New Service
                </strong>

                <small>
                  Browse our available services
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* =================================================
            ACCOUNT ACTIONS
        ================================================= */}

        <section className="profile-section">

          <h2>
            Account
          </h2>

          <div className="account-actions">

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Profile;