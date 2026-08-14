import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Remove error while user is typing
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDATION
    // =========================

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // REGISTER USER
      // =========================

      const response = await api.post("/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccess(
        response.data.message || "Account created successfully!"
      );

      // =========================
      // GO TO LOGIN
      // =========================

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
          "Registration failed. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Please make sure Flask is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        {/* LEFT / WELCOME SECTION */}
        <div className="register-welcome">

          <div className="welcome-icon">
            ✨
          </div>

          <h2>
            Welcome to
            <br />
            Ramon's Marketplace
          </h2>

          <p>
            Create your account and discover trusted
            professionals for the services you need.
          </p>

          <div className="welcome-features">
            <div>
              <span>✓</span>
              Trusted service providers
            </div>

            <div>
              <span>✓</span>
              Easy online booking
            </div>

            <div>
              <span>✓</span>
              Convenient service management
            </div>
          </div>

        </div>


        {/* REGISTER FORM */}
        <div className="register-form-section">

          <div className="register-heading">

            <h1>
              Create Account
            </h1>

            <p>
              Join Ramon's Marketplace today
            </p>

          </div>


          <form
            onSubmit={submit}
            className="register-form"
          >

            {/* NAME */}
            <div className="form-group">

              <label htmlFor="name">
                Full Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address <span>*</span>
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password <span>*</span>
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <small>
                Password must contain at least 6 characters.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}
            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password <span>*</span>
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

            </div>


            {/* ERROR */}
            {error && (
              <div className="register-message error-message">
                ⚠️ {error}
              </div>
            )}


            {/* SUCCESS */}
            {success && (
              <div className="register-message success-message">
                ✓ {success}
              </div>
            )}


            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}

            </button>


            {/* LOGIN */}
            <p className="login-link">

              Already have an account?

              {" "}

              <Link to="/login">
                Login here
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Register;