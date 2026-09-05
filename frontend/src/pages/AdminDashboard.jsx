import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Remove all stored authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Return to Home page
    navigate("/");
  };

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        // Check whether login token exists
        const token = localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            setError(
              "You are not logged in. Please log in as an administrator."
            );
            setLoading(false);
          }

          return;
        }

        // Check stored role
        const role = localStorage.getItem("role");

        console.log("=================================");
        console.log("ADMIN DASHBOARD");
        console.log("Token exists:", !!token);
        console.log("Stored role:", role);
        console.log("=================================");

        if (role && role.toLowerCase() !== "admin") {
          if (!cancelled) {
            setError(
              "Access denied. You must be logged in as an administrator."
            );
            setLoading(false);
          }

          return;
        }

        // Axios automatically attaches:
        // Authorization: Bearer <token>
        const response = await api.get("/admin/bookings");

        console.log("Bookings response:", response.data);

        if (!cancelled) {
          const data = response.data;

          if (Array.isArray(data)) {
            setBookings(data);
          } else if (Array.isArray(data?.bookings)) {
            setBookings(data.bookings);
          } else {
            setBookings([]);
          }

          setError("");
        }
      } catch (err) {
        console.error("Failed to load bookings:", err);

        if (!cancelled) {
          // =================================================
          // 401 - UNAUTHORIZED
          // =================================================

          if (err.response?.status === 401) {
            setError(
              err.response?.data?.message ||
                "Your administrator session is invalid or has expired. Please log in again."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
          }

          // =================================================
          // 403 - FORBIDDEN
          // =================================================

          else if (err.response?.status === 403) {
            setError(
              err.response?.data?.message ||
                "Access denied. Administrator privileges are required."
            );
          }

          // =================================================
          // 500 - SERVER ERROR
          // =================================================

          else if (err.response?.status === 500) {
            setError(
              "The server encountered an error while loading the orders. Please check your Flask backend."
            );
          }

          // =================================================
          // NETWORK ERROR
          // =================================================

          else if (err.request && !err.response) {
            setError(
              "Unable to connect to the server. Please make sure your Flask backend is running."
            );
          }

          // =================================================
          // OTHER ERRORS
          // =================================================

          else {
            setError(
              err.response?.data?.message ||
                "Failed to load bookings. Please try again."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // UPDATE BOOKING STATUS
  // =====================================================

  const updateStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Your session has expired. Please log in again.");

        navigate("/login");

        return;
      }

      console.log(
        `Updating booking #${bookingId} to status: ${status}`
      );

      await api.put(
        `/admin/bookings/${bookingId}`,
        {
          status: status,
        }
      );

      // Update UI immediately
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: status,
              }
            : booking
        )
      );

      console.log(
        `Booking #${bookingId} successfully updated to ${status}`
      );
    } catch (err) {
      console.error("Status update failed:", err);

      // ===================================================
      // 401
      // ===================================================

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        alert(
          "Your administrator session has expired. Please log in again."
        );

        navigate("/login");

        return;
      }

      // ===================================================
      // 403
      // ===================================================

      if (err.response?.status === 403) {
        alert(
          err.response?.data?.message ||
            "You do not have permission to update this booking."
        );

        return;
      }

      // ===================================================
      // OTHER ERROR
      // ===================================================

      alert(
        err.response?.data?.message ||
          "Failed to update booking."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-dashboard">

        <div className="admin-message">

          <div className="loading-spinner"></div>

          <h2>
            Loading Orders...
          </h2>

          <p>
            Please wait while we load customer bookings.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-dashboard">

        <div className="admin-error">

          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Orders
          </h2>

          <p>
            {error}
          </p>

          <div className="error-actions">

            <button
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>

            <button
              className="home-button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const pendingCount = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "confirmed"
  ).length;

  const completedCount = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "completed"
  ).length;

  const totalRevenue = bookings.reduce(
    (total, booking) =>
      total + Number(booking.total || 0),
    0
  );

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="admin-header">

        <div className="admin-header-content">

          <div>

            <span className="admin-label">
              ADMINISTRATION
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage customer bookings and orders.
            </p>

          </div>

          {/* LOGOUT BUTTON */}

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            type="button"
          >
            🚪 Logout
          </button>

        </div>

      </div>

      {/* =================================================
          STATISTICS
          ================================================= */}

      <div className="admin-stats">

        {/* TOTAL ORDERS */}

        <div className="stat-card">

          <span>
            📦
          </span>

          <div>

            <p>
              Total Orders
            </p>

            <h2>
              {bookings.length}
            </h2>

          </div>

        </div>

        {/* PENDING */}

        <div className="stat-card">

          <span>
            ⏳
          </span>

          <div>

            <p>
              Pending
            </p>

            <h2>
              {pendingCount}
            </h2>

          </div>

        </div>

        {/* CONFIRMED */}

        <div className="stat-card">

          <span>
            ✅
          </span>

          <div>

            <p>
              Confirmed
            </p>

            <h2>
              {confirmedCount}
            </h2>

          </div>

        </div>

        {/* COMPLETED */}

        <div className="stat-card">

          <span>
            🎉
          </span>

          <div>

            <p>
              Completed
            </p>

            <h2>
              {completedCount}
            </h2>

          </div>

        </div>

        {/* REVENUE */}

        <div className="stat-card">

          <span>
            💰
          </span>

          <div>

            <p>
              Total Revenue
            </p>

            <h2>
              Ksh{" "}
              {totalRevenue.toLocaleString()}
            </h2>

          </div>

        </div>

      </div>

      {/* =================================================
          ORDERS SECTION
          ================================================= */}

      <div className="orders-section">

        <div className="orders-header">

          <div>

            <h2>
              Customer Orders
            </h2>

            <p>
              All bookings made by customers.
            </p>

          </div>

          <span className="order-count">
            {bookings.length}{" "}
            {bookings.length === 1
              ? "Order"
              : "Orders"}
          </span>

        </div>

        {/* =================================================
            NO ORDERS
            ================================================= */}

        {bookings.length === 0 ? (

          <div className="no-orders">

            <div>
              📭
            </div>

            <h3>
              No Orders Yet
            </h3>

            <p>
              Customer bookings will appear here.
            </p>

          </div>

        ) : (

          /* =================================================
             ORDERS TABLE
             ================================================= */

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Service
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {bookings.map(
                  (booking) => (

                    <tr
                      key={booking.id}
                    >

                      {/* ORDER */}

                      <td>

                        <strong>
                          #{booking.id}
                        </strong>

                      </td>

                      {/* CUSTOMER */}

                      <td>

                        <strong>
                          {booking.customerName ||
                            booking.customer?.name ||
                            "Customer"}
                        </strong>

                        <small>
                          {booking.customerEmail ||
                            booking.customer?.email ||
                            ""}
                        </small>

                      </td>

                      {/* SERVICE */}

                      <td>

                        <strong>
                          {booking.serviceName ||
                            "Service"}
                        </strong>

                        {booking.categoryName && (
                          <small>
                            {booking.categoryName}
                          </small>
                        )}

                      </td>

                      {/* DATE */}

                      <td>
                        {booking.date || "-"}
                      </td>

                      {/* TIME */}

                      <td>
                        {booking.time || "-"}
                      </td>

                      {/* LOCATION */}

                      <td>

                        <div>
                          {booking.address || "-"}
                        </div>

                        {booking.estate && (
                          <small>
                            {booking.estate}
                          </small>
                        )}

                        {booking.city && (
                          <small>
                            {booking.city}
                          </small>
                        )}

                      </td>

                      {/* AMOUNT */}

                      <td>

                        <strong>
                          Ksh{" "}
                          {Number(
                            booking.total || 0
                          ).toLocaleString()}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <select
                          value={
                            booking.status ||
                            "Pending"
                          }
                          onChange={(event) =>
                            updateStatus(
                              booking.id,
                              event.target.value
                            )
                          }
                        >

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Confirmed">
                            Confirmed
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>

                        </select>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;