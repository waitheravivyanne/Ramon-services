import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/forgot-password",
        {
          email,
        }
      );

      setMessage(
        response.data?.message ||
        "If an account exists with that email, a password reset link has been sent."
      );

      setEmail("");

    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to process your password reset request."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">

      <form
        className="forgot-password-form"
        onSubmit={handleSubmit}
      >

        <div className="forgot-password-icon">
          🔑
        </div>

        <h1>
          Forgot Password?
        </h1>

        <p>
          Enter the email address associated
          with your Ramon's Marketplace account.
        </p>

        <p>
          If the account exists, you will receive
          instructions to reset your password.
        </p>

        {/* SUCCESS */}

        {message && (
          <div className="forgot-password-success">
            ✅ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="forgot-password-error">
            ⚠️ {error}
          </div>
        )}

        <div className="forgot-password-group">

          <label htmlFor="reset-email">
            Email Address
          </label>

          <input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
          />

        </div>

        <button
          type="submit"
          className="forgot-password-button"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link →"}
        </button>

        <div className="back-to-login">

          <Link to="/login">
            ← Back to Login
          </Link>

        </div>

      </form>

    </div>
  );
}

export default ForgotPassword;