import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      console.log("=================================");
      console.log("STARTING LOGIN");
      console.log("EMAIL:", form.email);
      console.log("=================================");

      const response = await api.post("/login", form);

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data?.token;

      if (!token) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      const user = response.data?.user;

      if (!user) {
        throw new Error(
          "Login succeeded but no user information was returned."
        );
      }

      console.log("LOGIN USER:", user);

      const role = String(user.role || "")
        .trim()
        .toLowerCase();

      console.log("NORMALIZED ROLE:", role);

      // -------------------------------------------------
      // SAVE AUTHENTICATION
      // -------------------------------------------------

      login({
        token,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role,
      });

      // -------------------------------------------------
      // SAVE TO LOCAL STORAGE
      // -------------------------------------------------

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role,
        })
      );

      localStorage.setItem("role", role);

      console.log("AUTHENTICATION SAVED");
      console.log(
        "TOKEN EXISTS:",
        !!localStorage.getItem("token")
      );
      console.log(
        "STORED ROLE:",
        localStorage.getItem("role")
      );

      // -------------------------------------------------
      // ADMIN
      // -------------------------------------------------

      if (role === "admin") {
        console.log("ADMIN DETECTED");
        console.log("REDIRECTING TO /admin");

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // CUSTOMER
      // -------------------------------------------------

      const previousPage =
        location.state?.from?.pathname;

      const previousSearch =
        location.state?.from?.search || "";

      if (
        previousPage &&
        previousPage !== "/login"
      ) {
        console.log(
          "RETURNING CUSTOMER TO:",
          previousPage
        );

        navigate(
          previousPage + previousSearch,
          {
            replace: true,
          }
        );

        return;
      }

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid email or password.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <form
        className="login-form"
        onSubmit={submit}
      >

        {/* ICON */}

        <div className="login-icon">
          🔐
        </div>

        {/* TITLE */}

        <h1>
          Welcome Back!
        </h1>

        <p className="login-subtitle">
          Login to your Ramon's Marketplace
          account and continue booking services.
        </p>

        {/* ERROR */}

        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        {/* EMAIL */}

        <div className="login-group">

          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

        </div>

        {/* PASSWORD */}

        <div className="login-group">

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

        </div>

        {/* FORGOT PASSWORD */}

        <div className="forgot-password-container">

          <Link
            to="/forgot-password"
            className="forgot-password-link"
          >
            Forgot Password?
          </Link>

        </div>

        {/* LOGIN BUTTON */}

        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >

          {loading ? (
            <>
              <span className="login-spinner"></span>
              Logging in...
            </>
          ) : (
            "Login to Account →"
          )}

        </button>

        {/* REGISTER */}

        <div className="login-register">

          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </div>

      </form>

    </div>
  );
}

export default Login;