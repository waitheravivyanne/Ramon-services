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
   * LOAD BOOKINGS
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
        response.data
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
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
   *
   * The effect calls an async function declared inside
   * the effect instead of directly calling loadBookings().
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Loading customer bookings...");

        const response = await api.get("/bookings/my");

        if (cancelled) {
          return;
        }

        console.log(
          "CUSTOMER BOOKINGS RESPONSE:",
          response.data
        );

        const data = response.data;

        if (Array.isArray(data)) {
          setBookings(data);
        } else if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

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
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
   * =====================================================
   * STATUS
   * =====================================================
   */

  const getStatusClass = (status) => {
    const normalized = String(
      status || "Pending"
    ).toLowerCase();

    if (normalized.includes("complete")) {
      return "status-completed";
    }

    if (normalized.includes("progress")) {
      return "status-progress";
    }

    if (normalized.includes("confirm")) {
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

  const getStatusIcon = (status) => {
    const normalized = String(
      status || "Pending"
    ).toLowerCase();

    if (normalized.includes("complete")) {
      return "✓";
    }

    if (normalized.includes("progress")) {
      return "⚙";
    }

    if (normalized.includes("confirm")) {
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
   * FORMAT DATE
   * =====================================================
   */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =====================================================
   * FORMAT MONEY
   * =====================================================
   */

  const formatMoney = (amount) => {
    const number = Number(amount || 0);

    return `KSh ${number.toLocaleString("en-KE")}`;
  };

  /*
   * =====================================================
   * FILTER BOOKINGS
   * =====================================================
   */

  const filteredBookings = bookings.filter(
    (booking) => {
      if (filter === "All") {
        return true;
      }

      const status = String(
        booking.status || "Pending"
      ).toLowerCase();

      return (
        status === filter.toLowerCase()
      );
    }
  );

  /*
   * =====================================================
   * STATISTICS
   * =====================================================
   */

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      String(
        booking.status || "Pending"
      ).toLowerCase() === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      String(
        booking.status || ""
      ).toLowerCase() === "confirmed"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      String(
        booking.status || ""
      ).toLowerCase() === "completed"
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

          <h1>
            My Bookings
          </h1>

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
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>


      {/* STATISTICS */}

      <div className="booking-statistics">

        <div className="booking-stat-card">

          <div className="stat-icon">
            📋
          </div>

          <div>
            <span>
              Total Bookings
            </span>

            <strong>
              {totalBookings}
            </strong>
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingBookings}
            </strong>
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>
            <span>
              Confirmed
            </span>

            <strong>
              {confirmedBookings}
            </strong>
          </div>

        </div>


        <div className="booking-stat-card">

          <div className="stat-icon">
            ★
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedBookings}
            </strong>
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
            onClick={() =>
              setFilter(status)
            }
          >
            {status}
          </button>

        ))}

      </div>


      {/* ERROR */}

      {error && (

        <div className="bookings-error">

          <strong>
            Unable to load bookings
          </strong>

          <p>
            {error}
          </p>

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
              No Bookings Found
            </h2>

            <p>
              You don't have any bookings
              in this category yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/services")
              }
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

            {filteredBookings.map(
              (booking) => {

                const status =
                  booking.status ||
                  "Pending";

                const serviceName =
                  booking.serviceName ||
                  booking.service?.name ||
                  "Service";

                const categoryName =
                  booking.categoryName ||
                  booking.category?.name ||
                  "";

                return (

                  <div
                    className="booking-card"
                    key={booking.id}
                  >

                    {/* TOP */}

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


                      {/* STATUS */}

                      <div
                        className={`booking-status ${getStatusClass(
                          status
                        )}`}
                      >

                        <span>
                          {getStatusIcon(
                            status
                          )}
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
                          {formatDate(
                            booking.date
                          )}
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
                          {formatMoney(
                            booking.total
                          )}
                        </strong>

                      </div>

                    </div>


                    {/* EXTRA DETAILS */}

                    {(booking.houseSize ||
                      booking.cleaningType ||
                      booking.frequency ||
                      booking.notes) && (

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
                        Booking ID: #
                        {booking.id}
                      </span>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

    </div>
  );
}

export default Bookings;