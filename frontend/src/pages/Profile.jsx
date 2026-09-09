import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

        console.log("PROFILE RESPONSE:", response.data);

        const user =
          response.data.user ||
          response.data;

        setProfile(user);

        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone:
            user?.phone ||
            user?.phoneNumber ||
            "",
        });

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
     HANDLE INPUT
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     START EDITING
  ===================================================== */

  const handleEdit = () => {
    setSuccess("");
    setError("");

    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone:
        profile?.phone ||
        profile?.phoneNumber ||
        "",
    });

    setEditing(true);
  };

  /* =====================================================
     CANCEL EDITING
  ===================================================== */

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone:
        profile?.phone ||
        profile?.phoneNumber ||
        "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/profile",
        {
          name,
          email,
          phone,
        }
      );

      console.log(
        "UPDATED PROFILE:",
        response.data
      );

      const updatedUser =
        response.data.user ||
        response.data;

      setProfile(updatedUser);

      setFormData({
        name: updatedUser?.name || name,
        email: updatedUser?.email || email,
        phone:
          updatedUser?.phone ||
          updatedUser?.phoneNumber ||
          phone,
      });

      /*
       * Keep localStorage user information
       * synchronized with the updated profile.
       */
      const storedUser =
        localStorage.getItem("user");

      let userToStore = {
        ...(storedUser
          ? JSON.parse(storedUser)
          : {}),
        ...updatedUser,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(userToStore)
      );

      if (updatedUser?.role) {
        localStorage.setItem(
          "role",
          updatedUser.role
        );
      }

      setSuccess(
        "Your profile has been updated successfully."
      );

      setEditing(false);

    } catch (err) {
      console.error(
        "FAILED TO UPDATE PROFILE:",
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
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (error && !profile) {
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
    .filter(Boolean)
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
            SUCCESS MESSAGE
        ================================================= */}

        {success && (
          <div className="profile-success">
            ✅ {success}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && profile && (
          <div className="profile-error-message">
            ⚠️ {error}
          </div>
        )}

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

          {!editing && (
            <button
              type="button"
              className="edit-profile-button"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>
          )}

        </div>

        {/* =================================================
            EDIT PROFILE
        ================================================= */}

        {editing ? (

          <section className="profile-section edit-profile-section">

            <div className="section-heading">
              <div>
                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your personal account information.
                </p>
              </div>
            </div>

            <form
              className="profile-edit-form"
              onSubmit={handleSave}
            >

              <div className="profile-form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

              </div>

              <div className="profile-form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />

              </div>

              <div className="profile-form-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0712345678"
                  autoComplete="tel"
                />

              </div>

              <div className="profile-edit-actions">

                <button
                  type="button"
                  className="cancel-profile-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save Changes"}
                </button>

              </div>

            </form>

          </section>

        ) : (

          /* =================================================
             PERSONAL INFORMATION
          ================================================= */

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
        )}

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
                  View your bookings and track
                  their status
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
              🚪 Log Out
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Profile;