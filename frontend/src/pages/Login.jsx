import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import api from "../api/axios";
import useAuth from "../hooks/useAuth";

import "../styles/Login.css";


function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();


  // =========================================
  // FORM
  // =========================================

  const [form, setForm] = useState({
    email: "",
    password: ""
  });


  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] = useState(false);


  // =========================================
  // ERROR
  // =========================================

  const [error, setError] = useState("");


  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    if (error) {
      setError("");
    }

  };


  // =========================================
  // LOGIN
  // =========================================

  const submit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await api.post(
        "/login",
        form
      );


      console.log(
        "LOGIN RESPONSE:",
        response.data
      );


      // =====================================
      // GET USER
      // =====================================

      const user = response.data.user;


      if (!user) {

        throw new Error(
          "User information was not returned by the server."
        );

      }


      // =====================================
      // SAVE LOGIN INFORMATION
      // =====================================

      login({

        token: response.data.token,

        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role

      });


      console.log(
        "LOGGED IN USER:",
        user
      );


      // =====================================
      // ADMIN
      // =====================================

    if (user.role === "admin") {

  navigate("/admin");

  return;
}

navigate("/services");


      // =====================================
      // CUSTOMER
      // =====================================

      /*
        If the customer originally tried to
        access a protected page, send them
        back there.

        Example:

        User clicks Book Service
        ↓
        Login required
        ↓
        User logs in
        ↓
        They return to Booking page
      */

      const previousPage =
        location.state?.from?.pathname;


      const previousSearch =
        location.state?.from?.search || "";


      if (
        previousPage &&
        previousPage !== "/login"
      ) {

        console.log(
          "RETURNING USER TO:",
          previousPage
        );


        navigate(
          previousPage + previousSearch,
          {
            replace: true
          }
        );

        return;

      }


      // =====================================
      // DEFAULT CUSTOMER DESTINATION
      // =====================================

      /*
        IMPORTANT:

        We are NOT sending the customer
        automatically to "/".

        Instead send them to the dashboard.
      */

      console.log(
        "CUSTOMER LOGIN → /dashboard"
      );


      navigate(
        "/dashboard",
        {
          replace: true
        }
      );


    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );


      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password.";


      setError(message);

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="login-page">

      <form
        className="login-form"
        onSubmit={submit}
      >


        {/* =====================================
            ICON
        ===================================== */}

        <div className="login-icon">
          🔐
        </div>


        {/* =====================================
            TITLE
        ===================================== */}

        <h1>
          Welcome Back!
        </h1>


        <p className="login-subtitle">

          Login to your Ramon's Marketplace
          account and continue booking services.

        </p>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="login-error">

            ⚠️ {error}

          </div>

        )}


        {/* =====================================
            EMAIL
        ===================================== */}

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


        {/* =====================================
            PASSWORD
        ===================================== */}

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


        {/* =====================================
            LOGIN BUTTON
        ===================================== */}

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


        {/* =====================================
            REGISTER
        ===================================== */}

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