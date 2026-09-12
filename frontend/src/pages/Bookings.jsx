import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Bookings.css";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  /*
   * =====================================================
   * NORMALIZE STATUS
   * =====================================================
   */
  const normalizeStatus = (status) => {
    return String(status || "Pending")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  /*
   * =====================================================
   * FORMAT MONEY
   * =====================================================
   */
  const formatMoney = (amount) => {
    const number = Number(amount);

    if (!Number.isFinite(number)) {
      return "KSh 0";
    }

    return `KSh ${number.toLocaleString("en-KE")}`;
  };

  /*
   * =====================================================
   * FORMAT DATE
   * =====================================================
   */
  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * =====================================================
   * GET STATUS CLASS
   * =====================================================
   */
  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized.includes("complete")) {
      return "status-completed";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("working")
    ) {
      return "status-progress";
    }

    if (
      normalized.includes("confirm") ||
      normalized.includes("accepted")
    ) {
      return "status-confirmed";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "status-cancelled";
    }

    return "status-pending";
  };

  /*
   * =====================================================
   * GET STATUS ICON
   * =====================================================
   */
  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized.includes("complete")) {
      return "✓";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("working")
    ) {
      return "⚙";
    }

    if (
      normalized.includes("confirm") ||
      normalized.includes("accepted")
    ) {
      return "✓";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return "×";
    }

    return "⏳";
  };

  /*
   * =====================================================
   * LOAD CUSTOMER BOOKINGS
   *
   * ONLY ONE API REQUEST IS USED.
   * =====================================================
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Loading customer bookings...");

      const response = await api.get("/bookings/my");

      console.log(
        "CUSTOMER BOOKINGS RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      const data = response.data;

      let customerBookings = [];

      if (Array.isArray(data)) {
        customerBookings = data;
      } else if (Array.isArray(data?.bookings)) {
        customerBookings = data.bookings;
      }

      console.log(
        "CUSTOMER BOOKINGS COUNT:",
        customerBookings.length
      );

      console.log(
        "CUSTOMER BOOKINGS:",
        customerBookings
      );

      setBookings(customerBookings);
    } catch (err) {
      console.error(
        "FAILED TO LOAD CUSTOMER BOOKINGS:",
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
          "Unable to load your bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */
  useEffect(() => {
  let cancelled = false;

  const fetchBookings = async () => {
    if (cancelled) return;
    await loadBookings();
  };

  fetchBookings();

  return () => {
    cancelled = true;
  };
}, [loadBookings]);

  /*
   * =====================================================
   * FILTER BOOKINGS
   * =====================================================
   */
  const filteredBookings = bookings.filter((booking) => {
    const status = normalizeStatus(booking.status);

    if (filter === "All") {
      return true;
    }

    return status === normalizeStatus(filter);
  });

  /*
   * =====================================================
   * STATISTICS
   * =====================================================
   */
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "confirmed"
  ).length;

  const inProgressBookings = bookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "in progress"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "completed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "cancelled"
  ).length;

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */
  return (
    <div className="bookings-page">

      {/* HEADER */}
      <div className="bookings-header">
        <div>
          <button
            type="button"
            className="bookings-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>My Bookings</h1>

          <p>
            Track all your service bookings
            and their current status.
          </p>
        </div>

        <button
          type="button"
          className="refresh-bookings-button"
          onClick={loadBookings}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* STATISTICS */}
      <div className="booking-statistics">

        <div className="booking-stat-card">
          <div className="stat-icon">📋</div>
          <div>
            <span>Total Bookings</span>
            <strong>{totalBookings}</strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <span>Pending</span>
            <strong>{pendingBookings}</strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>Confirmed</span>
            <strong>{confirmedBookings}</strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="stat-icon">⚙️</div>
          <div>
            <span>In Progress</span>
            <strong>{inProgressBookings}</strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="stat-icon">★</div>
          <div>
            <span>Completed</span>
            <strong>{completedBookings}</strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="stat-icon">×</div>
          <div>
            <span>Cancelled</span>
            <strong>{cancelledBookings}</strong>
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="booking-filters">
        {[
          "All",
          "Pending",
          "Confirmed",
          "In Progress",
          "Completed",
          "Cancelled",
        ].map((status) => (
          <button
            key={status}
            type="button"
            className={
              filter === status
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bookings-error">
          <strong>Unable to load bookings</strong>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadBookings}
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bookings-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading your bookings...
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        filteredBookings.length === 0 && (
          <div className="no-bookings">

            <div className="no-bookings-icon">
              📋
            </div>

            <h2>
              {filter === "All"
                ? "No Bookings Found"
                : `No ${filter} Bookings`}
            </h2>

            <p>
              {filter === "All"
                ? "You don't have any bookings yet."
                : `You don't have any ${filter.toLowerCase()} bookings.`}
            </p>

            <button
              type="button"
              onClick={() => navigate("/services")}
            >
              Browse Services
            </button>

          </div>
        )}

      {/* BOOKINGS */}
      {!loading &&
        !error &&
        filteredBookings.length > 0 && (
          <div className="bookings-list">

            {filteredBookings.map((booking) => {

              /*
               * SERVICE INFORMATION
               *
               * The current backend response does not include
               * serviceName, so use useful fallbacks instead
               * of displaying a blank card.
               */

              const serviceName =
                booking.serviceName ||
                booking.service?.name ||
                booking.service_name ||
                booking.serviceTitle ||
                `Service #${booking.serviceId || ""}`.trim();

              const categoryName =
                booking.categoryName ||
                booking.category?.name ||
                booking.category_name ||
                `Category #${booking.categoryId || ""}`.trim();

              const status =
                booking.status || "Pending";

              const paymentStatus =
                booking.paymentStatus ||
                booking.payment_status ||
                "";

              /*
               * EXTRAS
               *
               * Backend currently sends extras as:
               * "[]"
               *
               * so safely convert JSON strings into arrays.
               */

              let extras =
                booking.extras ||
                booking.selectedExtras ||
                [];

              if (typeof extras === "string") {
                try {
                  extras = JSON.parse(extras);
                } catch {
                  extras = [];
                }
              }

              if (!Array.isArray(extras)) {
                extras = [];
              }

              return (
                <div
                  className="booking-card"
                  key={
                    booking.id ||
                    `${serviceName}-${booking.date}-${booking.time}`
                  }
                >

                  {/* CARD TOP */}
                  <div className="booking-card-top">

                    <div>
                      <span className="booking-number">
                        Booking #{booking.id}
                      </span>

                      <h2>
                        {serviceName}
                      </h2>

                      {categoryName && (
                        <p className="booking-category">
                          {categoryName}
                        </p>
                      )}
                    </div>

                    <div
                      className={`booking-status ${getStatusClass(
                        status
                      )}`}
                    >
                      <span>
                        {getStatusIcon(status)}
                      </span>

                      {status}
                    </div>

                  </div>

                  {/* DETAILS */}
                  <div className="booking-details">

                    <div className="booking-detail">
                      <span className="detail-label">
                        📅 Date
                      </span>

                      <strong>
                        {formatDate(booking.date)}
                      </strong>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-label">
                        🕐 Time
                      </span>

                      <strong>
                        {booking.time ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="booking-detail">
                      <span className="detail-label">
                        📍 Location
                      </span>

                      <strong>
                        {booking.address ||
                          "Not specified"}
                      </strong>

                      {booking.estate && (
                        <small>
                          {booking.estate}
                          {booking.city
                            ? `, ${booking.city}`
                            : ""}
                        </small>
                      )}
                    </div>

                    <div className="booking-detail">
                      <span className="detail-label">
                        💰 Total
                      </span>

                      <strong className="booking-price">
                        {formatMoney(booking.total)}
                      </strong>
                    </div>

                  </div>

                  {/* EXTRA DETAILS */}
                  {(booking.houseSize ||
                    booking.cleaningType ||
                    booking.frequency) && (
                    <div className="booking-extra">

                      {booking.houseSize && (
                        <div>
                          <span>
                            House Size
                          </span>

                          <strong>
                            {booking.houseSize}
                          </strong>
                        </div>
                      )}

                      {booking.cleaningType && (
                        <div>
                          <span>
                            Cleaning Type
                          </span>

                          <strong>
                            {booking.cleaningType}
                          </strong>
                        </div>
                      )}

                      {booking.frequency && (
                        <div>
                          <span>
                            Frequency
                          </span>

                          <strong>
                            {booking.frequency}
                          </strong>
                        </div>
                      )}

                    </div>
                  )}

                  {/* EXTRAS */}
                  {extras.length > 0 && (
                    <div className="booking-notes">

                      <strong>
                        Additional Services
                      </strong>

                      <p>
                        {extras
                          .map((extra) => {
                            if (
                              typeof extra ===
                              "string"
                            ) {
                              return extra;
                            }

                            return (
                              extra?.name ||
                              extra?.label ||
                              extra?.title ||
                              ""
                            );
                          })
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                    </div>
                  )}

                  {/* NOTES */}
                  {booking.notes && (
                    <div className="booking-notes">

                      <strong>
                        Notes
                      </strong>

                      <p>
                        {booking.notes}
                      </p>

                    </div>
                  )}

                  {/* PAYMENT */}
                  {paymentStatus && (
                    <div className="booking-notes">

                      <strong>
                        Payment Status
                      </strong>

                      <p>
                        {paymentStatus}
                      </p>

                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="booking-card-footer">

                    <span>
                      Booked on{" "}
                      {formatDate(
                        booking.createdAt ||
                        booking.created_at
                      )}
                    </span>

                    <span>
                      Booking ID: #{booking.id}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}

export default Bookings;