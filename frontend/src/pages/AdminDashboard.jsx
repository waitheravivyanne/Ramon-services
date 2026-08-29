
import { useEffect, useState } from "react";
import api from "../api/axios";
// import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        // Check whether the login token exists
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

        console.log("Admin Dashboard");
        console.log("Token exists:", !!token);
        console.log("Stored role:", role);

        if (role && role.toLowerCase() !== "admin") {
          if (!cancelled) {
            setError(
              "Access denied. You must be logged in as an administrator."
            );
            setLoading(false);
          }

          return;
        }

        // Axios instance should automatically attach
        // Authorization: Bearer <token>
        const response = await api.get("/admin/bookings");

        console.log("Bookings response:", response.data);

        if (!cancelled) {
          setBookings(
            Array.isArray(response.data)
              ? response.data
              : response.data?.bookings || []
          );

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

            // Remove invalid login information
            localStorage.removeItem("token");
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
        return;
      }

      await api.put(
        `/admin/bookings/${bookingId}`,
        {
          status: status,
        }
      );

      // Update the booking immediately in the UI
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
    } catch (err) {
      console.error("Status update failed:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        alert(
          "Your administrator session has expired. Please log in again."
        );

        return;
      }

      if (err.response?.status === 403) {
        alert(
          err.response?.data?.message ||
            "You do not have permission to update this booking."
        );

        return;
      }

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
          <h2>Loading Orders...</h2>
          <p>Please wait.</p>
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
          <h2>Unable to Load Orders</h2>

          <p>{error}</p>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const pendingCount = bookings.filter(
    (booking) =>
      booking.status === "Pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) =>
      booking.status === "Confirmed"
  ).length;

  const completedCount = bookings.filter(
    (booking) =>
      booking.status === "Completed"
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

      {/* HEADER */}

      <div className="admin-header">
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
      </div>

      {/* STATISTICS */}

      <div className="admin-stats">

        <div className="stat-card">
          <span>📦</span>

          <div>
            <p>Total Orders</p>

            <h2>
              {bookings.length}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <span>⏳</span>

          <div>
            <p>Pending</p>

            <h2>
              {pendingCount}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <span>✅</span>

          <div>
            <p>Confirmed</p>

            <h2>
              {confirmedCount}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <span>🎉</span>

          <div>
            <p>Completed</p>

            <h2>
              {completedCount}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <span>💰</span>

          <div>
            <p>Total Revenue</p>

            <h2>
              Ksh{" "}
              {totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

      </div>

      {/* ORDERS */}

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
            {bookings.length} Orders
          </span>

        </div>

        {/* NO ORDERS */}

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

          /* ORDERS TABLE */

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Status</th>
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
                            "Customer"}
                        </strong>

                        <small>
                          {booking.customerEmail ||
                            ""}
                        </small>

                      </td>

                      {/* SERVICE */}

                      <td>

                        <strong>
                          {booking.serviceName ||
                            "Service"}
                        </strong>

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

