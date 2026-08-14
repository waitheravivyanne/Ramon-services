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

  // Where the user was trying to go before login
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Remove error while typing
    if (error) {
      setError("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", form);

      const userData = {
        token: response.data.token,
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
      };

      // Save user through AuthContext
      login(userData);

      alert("Login successful! 🎉");

      // Send user back to the page they originally wanted
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid email or password.");
      }

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

        {/* LOGIN ICON */}
        <div className="login-icon">
          🔐
        </div>

        <h1>
          Welcome Back!
        </h1>

        <p className="login-subtitle">
          Login to your Ramon's Marketplace account
          and continue booking services.
        </p>

        {/* ERROR MESSAGE */}
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