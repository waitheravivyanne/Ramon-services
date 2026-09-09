import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);

  const navigate = useNavigate();

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getCustomerName = (booking) => {
    return (
      booking.customerName ||
      booking.customer_name ||
      booking.customer?.name ||
      booking.user?.name ||
      booking.userName ||
      "Customer"
    );
  };

  const getCustomerEmail = (booking) => {
    return (
      booking.customerEmail ||
      booking.customer_email ||
      booking.customer?.email ||
      booking.user?.email ||
      booking.email ||
      ""
    );
  };

  const getCustomerPhone = (booking) => {
    return (
      booking.customerPhone ||
      booking.customer_phone ||
      booking.paymentPhone ||
      booking.payment_phone ||
      booking.customer?.phone ||
      booking.customer?.phoneNumber ||
      booking.customer?.phone_number ||
      booking.user?.phone ||
      booking.user?.phoneNumber ||
      booking.user?.phone_number ||
      booking.phone ||
      booking.phoneNumber ||
      booking.phone_number ||
      "Not provided"
    );
  };

  const getTransactionCode = (booking) => {
    return (
      booking.transactionCode ||
      booking.transaction_code ||
      booking.mpesaReceipt ||
      booking.mpesa_receipt ||
      booking.mpesaTransactionCode ||
      booking.mpesa_transaction_code ||
      booking.paymentTransactionCode ||
      booking.payment_transaction_code ||
      ""
    );
  };

  const getPaymentMethod = (booking) => {
    const method =
      booking.paymentMethod ||
      booking.payment_method ||
      "";

    if (method === "mpesa_till") {
      return "M-PESA Till";
    }

    if (method === "mpesa") {
      return "M-PESA";
    }

    if (method === "cash") {
      return "Cash";
    }

    if (method === "card") {
      return "Card";
    }

    return method || "Not specified";
  };

  const getPaymentStatus = (booking) => {
    return (
      booking.paymentStatus ||
      booking.payment_status ||
      "Pending"
    );
  };

  const getServiceName = (booking) => {
    return (
      booking.serviceName ||
      booking.service_name ||
      booking.service?.name ||
      "Service"
    );
  };

  const getCategoryName = (booking) => {
    return (
      booking.categoryName ||
      booking.category_name ||
      booking.category?.name ||
      ""
    );
  };

  const getBookingStatusClass = (status) => {
    return String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const getPaymentStatusClass = (status) => {
    return String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
  };

  // ============================================================
  // LOAD BOOKINGS
  // ============================================================

  const loadBookings = async (showFullLoader = true) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in. Please log in as an administrator."
        );
        return;
      }

      const role = localStorage.getItem("role");

      console.log("=================================");
      console.log("ADMIN DASHBOARD");
      console.log("Token exists:", !!token);
      console.log("Stored role:", role);
      console.log("Loading admin bookings...");
      console.log("=================================");

      if (role && role.toLowerCase() !== "admin") {
        setError(
          "Access denied. You must be logged in as an administrator."
        );
        return;
      }

      const response = await api.get("/admin/bookings");

      console.log(
        "ADMIN BOOKINGS RESPONSE:",
        response.data
      );

      const data = response.data;

      let bookingList = [];

      if (Array.isArray(data)) {
        bookingList = data;
      } else if (Array.isArray(data?.bookings)) {
        bookingList = data.bookings;
      } else if (Array.isArray(data?.data)) {
        bookingList = data.data;
      }

      console.log(
        "Number of bookings received:",
        bookingList.length
      );

      // Debug useful payment/customer information
      bookingList.forEach((booking) => {
        console.log("BOOKING:", {
          id: booking.id,
          customer: getCustomerName(booking),
          phone: getCustomerPhone(booking),
          transactionCode: getTransactionCode(booking),
          paymentMethod: getPaymentMethod(booking),
          paymentStatus: getPaymentStatus(booking),
        });
      });

      setBookings(bookingList);
    } catch (err) {
      console.error(
        "Failed to load bookings:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          err.response?.data?.message ||
            "Your administrator session is invalid or has expired. Please log in again."
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "Access denied. Administrator privileges are required."
        );
      } else if (err.response?.status === 500) {
        setError(
          err.response?.data?.message ||
            "The server encountered an error while loading the orders. Please check your Flask backend."
        );
      } else if (err.request && !err.response) {
        setError(
          "Unable to connect to the server. Please make sure your Flask backend is running."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load bookings. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      if (cancelled) return;
      await loadBookings(true);
    };

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    await loadBookings(false);
  };

  // ============================================================
  // UPDATE BOOKING STATUS
  // ============================================================

  const updateStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "Your session has expired. Please log in again."
        );

        navigate("/login");
        return;
      }

      console.log(
        `Updating booking #${bookingId} to ${status}`
      );

      await api.put(
        `/admin/bookings/${bookingId}`,
        {
          status,
        }
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );

      console.log(
        `Booking #${bookingId} successfully updated.`
      );
    } catch (err) {
      console.error(
        "Status update failed:",
        err
      );

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

  // ============================================================
  // VERIFY / REJECT M-PESA PAYMENT
  // ============================================================

  const verifyPayment = async (bookingId, action) => {
    const booking = bookings.find(
      (item) => item.id === bookingId
    );

    if (!booking) {
      alert("Booking could not be found.");
      return;
    }

    const transactionCode =
      getTransactionCode(booking);

    if (!transactionCode) {
      alert(
        "This booking does not have an M-PESA transaction code."
      );
      return;
    }

    const paymentStatus =
      getPaymentStatus(booking);

    if (
      paymentStatus.toLowerCase() === "paid"
    ) {
      alert("This payment has already been verified.");
      return;
    }

    const actionText =
      action === "verify"
        ? "verify this M-PESA payment"
        : "reject this M-PESA payment";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText}?\n\n` +
        `Order: #${bookingId}\n` +
        `Transaction Code: ${transactionCode}\n` +
        `Amount: Ksh ${Number(
          booking.total || 0
        ).toLocaleString()}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingPayment(bookingId);

      console.log(
        `Payment action: ${action} for booking #${bookingId}`
      );

      const response = await api.put(
        `/admin/bookings/${bookingId}/verify-payment`,
        {
          action,
        }
      );

      console.log(
        "Payment verification response:",
        response.data
      );

      const updatedBooking =
        response.data?.booking ||
        response.data;

      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                ...updatedBooking,
                paymentStatus:
                  updatedBooking?.paymentStatus ||
                  updatedBooking?.payment_status ||
                  action === "verify"
                    ? "Paid"
                    : "Failed",
                payment_status:
                  updatedBooking?.payment_status ||
                  updatedBooking?.paymentStatus ||
                  action === "verify"
                    ? "Paid"
                    : "Failed",
              }
            : item
        )
      );

      alert(
        action === "verify"
          ? "M-PESA payment verified successfully."
          : "M-PESA payment rejected."
      );

      // Reload from server to make sure UI is synchronized
      await loadBookings(false);
    } catch (err) {
      console.error(
        "Payment verification failed:",
        err
      );

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

      if (err.response?.status === 403) {
        alert(
          err.response?.data?.message ||
            "Only administrators can verify payments."
        );

        return;
      }

      alert(
        err.response?.data?.message ||
          "Failed to process the payment verification."
      );
    } finally {
      setProcessingPayment(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-message">
          <div className="loading-spinner"></div>

          <h2>
            Loading Orders...
          </h2>

          <p>
            Please wait while we load customer
            bookings.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

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
              onClick={() =>
                navigate("/login")
              }
            >
              Go to Login
            </button>

            <button
              className="home-button"
              onClick={() =>
                navigate("/")
              }
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const pendingCount = bookings.filter(
    (booking) =>
      String(
        booking.status || "Pending"
      ).toLowerCase() === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) =>
      String(
        booking.status || ""
      ).toLowerCase() === "confirmed"
  ).length;

  const inProgressCount = bookings.filter(
    (booking) =>
      String(
        booking.status || ""
      ).toLowerCase() === "in progress"
  ).length;

  const completedCount = bookings.filter(
    (booking) =>
      String(
        booking.status || ""
      ).toLowerCase() === "completed"
  ).length;

  const paidCount = bookings.filter(
    (booking) =>
      String(
        getPaymentStatus(booking)
      ).toLowerCase() === "paid"
  ).length;

  const awaitingPaymentCount =
    bookings.filter(
      (booking) =>
        String(
          getPaymentStatus(booking)
        ).toLowerCase() ===
        "awaiting verification"
    ).length;

  const totalRevenue = bookings.reduce(
    (total, booking) =>
      total +
      Number(booking.total || 0),
    0
  );

  // ============================================================
  // MEMOIZED COUNTS
  // ============================================================

  const paymentVerificationCount = bookings.filter(
  (booking) =>
    String(getPaymentStatus(booking)).toLowerCase() ===
      "awaiting verification" &&
    !!getTransactionCode(booking)
).length;

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="admin-dashboard">

      {/* ======================================================
          HEADER
          ====================================================== */}

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
              Manage customer bookings,
              payments and orders.
            </p>
          </div>

          <div className="admin-header-actions">

            <button
              className="admin-refresh-btn"
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing
                ? "🔄 Refreshing..."
                : "🔄 Refresh"}
            </button>

            <button
              className="admin-logout-btn"
              onClick={handleLogout}
              type="button"
            >
              🚪 Logout
            </button>

          </div>

        </div>
      </div>

      {/* ======================================================
          STATISTICS
          ====================================================== */}

      <div className="admin-stats">

        {/* TOTAL ORDERS */}

        <div className="stat-card">
          <span>📦</span>

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
          <span>⏳</span>

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
          <span>✅</span>

          <div>
            <p>
              Confirmed
            </p>

            <h2>
              {confirmedCount}
            </h2>
          </div>
        </div>

        {/* IN PROGRESS */}

        <div className="stat-card">
          <span>🔧</span>

          <div>
            <p>
              In Progress
            </p>

            <h2>
              {inProgressCount}
            </h2>
          </div>
        </div>

        {/* COMPLETED */}

        <div className="stat-card">
          <span>🎉</span>

          <div>
            <p>
              Completed
            </p>

            <h2>
              {completedCount}
            </h2>
          </div>
        </div>

        {/* PAID */}

        <div className="stat-card">
          <span>💳</span>

          <div>
            <p>
              Paid
            </p>

            <h2>
              {paidCount}
            </h2>
          </div>
        </div>

        {/* AWAITING VERIFICATION */}

        <div className="stat-card">
          <span>🧾</span>

          <div>
            <p>
              Awaiting Verification
            </p>

            <h2>
              {awaitingPaymentCount}
            </h2>
          </div>
        </div>

        {/* REVENUE */}

        <div className="stat-card">
          <span>💰</span>

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

      {/* ======================================================
          PAYMENT ALERT
          ====================================================== */}

      {paymentVerificationCount > 0 && (
        <div className="payment-alert">
          <div className="payment-alert-icon">
            🧾
          </div>

          <div>
            <strong>
              {paymentVerificationCount} M-PESA
              payment
              {paymentVerificationCount === 1
                ? ""
                : "s"} awaiting verification
            </strong>

            <p>
              Check the transaction codes below
              against your M-PESA Till statement
              before approving payments.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          ORDERS SECTION
          ====================================================== */}

      <div className="orders-section">

        <div className="orders-header">

          <div>
            <h2>
              Customer Orders
            </h2>

            <p>
              View customer information,
              services, phone numbers and
              payment details.
            </p>
          </div>

          <span className="order-count">
            {bookings.length}{" "}
            {bookings.length === 1
              ? "Order"
              : "Orders"}
          </span>

        </div>

        {/* ====================================================
            NO ORDERS
            ==================================================== */}

        {bookings.length === 0 ? (

          <div className="no-orders">

            <div>
              📭
            </div>

            <h3>
              No Orders Yet
            </h3>

            <p>
              Customer bookings will appear
              here.
            </p>

          </div>

        ) : (

          /* ==================================================
             TABLE
             ================================================== */

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
                    Phone
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
                    Payment
                  </th>

                  <th>
                    Transaction Code
                  </th>

                  <th>
                    Payment Status
                  </th>

                  <th>
                    Order Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {bookings.map(
                  (booking) => {

                    const customerName =
                      getCustomerName(
                        booking
                      );

                    const customerEmail =
                      getCustomerEmail(
                        booking
                      );

                    const customerPhone =
                      getCustomerPhone(
                        booking
                      );

                    const transactionCode =
                      getTransactionCode(
                        booking
                      );

                    const paymentMethod =
                      getPaymentMethod(
                        booking
                      );

                    const paymentStatus =
                      getPaymentStatus(
                        booking
                      );

                    const bookingStatus =
                      booking.status ||
                      "Pending";

                    const isManualMpesa =
                      paymentMethod ===
                      "M-PESA Till";

                    const awaitingVerification =
                      paymentStatus
                        .toLowerCase() ===
                      "awaiting verification";

                    const isProcessing =
                      processingPayment ===
                      booking.id;

                    return (
                      <tr
                        key={
                          booking.id
                        }
                      >

                        {/* ORDER */}

                        <td>
                          <strong>
                            #
                            {
                              booking.id
                            }
                          </strong>

                          {booking.createdAt && (
                            <small>
                              {
                                booking.createdAt
                              }
                            </small>
                          )}
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          <div className="customer-info">

                            <strong>
                              {
                                customerName
                              }
                            </strong>

                            {customerEmail && (
                              <small>
                                {
                                  customerEmail
                                }
                              </small>
                            )}

                          </div>
                        </td>

                        {/* PHONE */}

                        <td>
                          <div className="phone-cell">

                            <span>
                              📱
                            </span>

                            <strong>
                              {
                                customerPhone
                              }
                            </strong>

                          </div>
                        </td>

                        {/* SERVICE */}

                        <td>
                          <div className="service-info">

                            <strong>
                              {
                                getServiceName(
                                  booking
                                )
                              }
                            </strong>

                            {getCategoryName(
                              booking
                            ) && (
                              <small>
                                {
                                  getCategoryName(
                                    booking
                                  )
                                }
                              </small>
                            )}

                            {booking.cleaningType && (
                              <small>
                                Cleaning:{" "}
                                {
                                  booking.cleaningType
                                }
                              </small>
                            )}

                          </div>
                        </td>

                        {/* DATE */}

                        <td>
                          {
                            booking.date ||
                            "-"
                          }
                        </td>

                        {/* TIME */}

                        <td>
                          {
                            booking.time ||
                            "-"
                          }
                        </td>

                        {/* LOCATION */}

                        <td>
                          <div className="location-info">

                            <strong>
                              {
                                booking.address ||
                                "-"
                              }
                            </strong>

                            {booking.houseNumber && (
                              <small>
                                House:{" "}
                                {
                                  booking.houseNumber
                                }
                              </small>
                            )}

                            {booking.estate && (
                              <small>
                                {
                                  booking.estate
                                }
                              </small>
                            )}

                            {booking.city && (
                              <small>
                                {
                                  booking.city
                                }
                              </small>
                            )}

                          </div>
                        </td>

                        {/* AMOUNT */}

                        <td>
                          <strong>
                            Ksh{" "}
                            {Number(
                              booking.total ||
                                0
                            ).toLocaleString()}
                          </strong>
                        </td>

                        {/* PAYMENT METHOD */}

                        <td>
                          <span
                            className={`payment-method ${paymentMethod
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {paymentMethod}
                          </span>
                        </td>

                        {/* TRANSACTION CODE */}

                        <td>

                          {transactionCode ? (

                            <div className="transaction-code">

                              <strong>
                                {
                                  transactionCode
                                }
                              </strong>

                              {isManualMpesa && (
                                <small>
                                  M-PESA Till
                                </small>
                              )}

                            </div>

                          ) : (

                            <span className="no-transaction">
                              —
                            </span>

                          )}

                        </td>

                        {/* PAYMENT STATUS */}

                        <td>

                          <div className="payment-status-wrapper">

                            <span
                              className={`payment-status-badge ${getPaymentStatusClass(
                                paymentStatus
                              )}`}
                            >
                              {
                                paymentStatus
                              }
                            </span>

                            {awaitingVerification &&
                              transactionCode && (
                                <div className="payment-actions">

                                  <button
                                    type="button"
                                    className="verify-payment-btn"
                                    disabled={
                                      isProcessing
                                    }
                                    onClick={() =>
                                      verifyPayment(
                                        booking.id,
                                        "verify"
                                      )
                                    }
                                  >
                                    {isProcessing
                                      ? "Processing..."
                                      : "✓ Verify"}
                                  </button>

                                  <button
                                    type="button"
                                    className="reject-payment-btn"
                                    disabled={
                                      isProcessing
                                    }
                                    onClick={() =>
                                      verifyPayment(
                                        booking.id,
                                        "reject"
                                      )
                                    }
                                  >
                                    ✕ Reject
                                  </button>

                                </div>
                              )}

                          </div>

                        </td>

                        {/* ORDER STATUS */}

                        <td>

                          <select
                            className={`booking-status-select ${getBookingStatusClass(
                              bookingStatus
                            )}`}
                            value={
                              bookingStatus
                            }
                            onChange={(
                              event
                            ) =>
                              updateStatus(
                                booking.id,
                                event.target
                                  .value
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
                    );
                  }
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