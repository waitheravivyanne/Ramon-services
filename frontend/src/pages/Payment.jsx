import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Payment.css";

// ============================================================
// M-PESA TILL NUMBER
// ============================================================

const MPESA_TILL_NUMBER =
  import.meta.env.VITE_MPESA_TILL_NUMBER || "1699138";

// ============================================================
// PAYMENT COMPONENT
// ============================================================

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // BOOKING DATA
  // ============================================================

  const booking = location.state?.booking;

  const total = Number(
    location.state?.total ??
      booking?.total ??
      0
  );

  // ============================================================
  // PAYMENT STATE
  // ============================================================

  const [paymentMethod, setPaymentMethod] =
    useState("mpesa");

  const [mpesaTransactionCode, setMpesaTransactionCode] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [cardName, setCardName] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ============================================================
  // GET SERVICE ID
  // ============================================================

  const getServiceId = () => {
    const value =
      booking?.serviceId ??
      booking?.service_id ??
      booking?.service?.id;

    const id = Number(value);

    return Number.isInteger(id) && id > 0
      ? id
      : null;
  };

  // ============================================================
  // GET CATEGORY ID
  // ============================================================

  const getCategoryId = () => {
    const value =
      booking?.categoryId ??
      booking?.category_id ??
      booking?.category?.id;

    const id = Number(value);

    return Number.isInteger(id) && id > 0
      ? id
      : null;
  };

  // ============================================================
  // CREATE BOOKING
  // ============================================================

  const createBooking = async () => {
    if (!booking) {
      throw new Error(
        "Booking information is missing."
      );
    }

    const serviceId = getServiceId();
    const categoryId = getCategoryId();

    if (!serviceId) {
      throw new Error(
        "The selected service ID is missing or invalid."
      );
    }

    if (!categoryId) {
      throw new Error(
        "The selected service category ID is missing or invalid."
      );
    }

    if (!total || total <= 0) {
      throw new Error(
        "The booking total is invalid."
      );
    }

    // ==========================================================
    // PAYLOAD MATCHES YOUR FLASK /bookings ROUTE
    // ==========================================================

    const payload = {
      serviceId: serviceId,

      categoryId: categoryId,

      total: Number(total),

      date: booking.date || "",

      time: booking.time || "",

      address: booking.address || "",

      city: booking.city || "",

      estate: booking.estate || "",

      houseNumber:
        booking.houseNumber || "",

      houseSize:
        booking.houseSize || "",

      cleaningType:
        booking.cleaningType ||
        booking.cleaningLevel ||
        "",

      frequency:
        booking.frequency || "",

      notes:
        booking.notes || "",

      extras:
        Array.isArray(booking.extras)
          ? booking.extras
          : [],

      paymentMethod:
        paymentMethod === "mpesa"
          ? "mpesa_till"
          : paymentMethod,

      // Manual Till payment does NOT need
      // the customer's phone number.
      paymentPhone: "",
    };

    console.log(
      "======================================"
    );

    console.log(
      "CREATING BOOKING"
    );

    console.log(
      "SERVICE ID:",
      serviceId
    );

    console.log(
      "CATEGORY ID:",
      categoryId
    );

    console.log(
      "TOTAL:",
      total
    );

    console.log(
      "BOOKING PAYLOAD:",
      payload
    );

    console.log(
      "======================================"
    );

    try {
      const response =
        await api.post(
          "/bookings",
          payload
        );

      console.log(
        "BOOKING CREATED:",
        response.data
      );

      return response;

    } catch (err) {

      console.error(
        "======================================"
      );

      console.error(
        "CREATE BOOKING FAILED"
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data
      );

      console.error(
        "SENT PAYLOAD:",
        payload
      );

      console.error(
        "======================================"
      );

      throw err;
    }
  };

  // ============================================================
  // GET BOOKING ID
  // ============================================================

  const getBookingId = (
    response
  ) => {

    return (
      response?.data?.booking?.id ??
      response?.data?.id ??
      response?.data?.bookingId ??
      response?.data?.booking_id ??
      null
    );
  };

  // ============================================================
  // SUBMIT MANUAL M-PESA PAYMENT
  // ============================================================

  const submitMpesaPayment = async (
    bookingId
  ) => {

    if (!bookingId) {
      throw new Error(
        "The booking was created but no booking ID was returned."
      );
    }

    const transactionCode =
      mpesaTransactionCode
        .trim()
        .toUpperCase();

    if (!transactionCode) {
      throw new Error(
        "Please enter your M-PESA transaction code."
      );
    }

    if (transactionCode.length < 5) {
      throw new Error(
        "The M-PESA transaction code appears too short."
      );
    }

    const payload = {
      bookingId:
        Number(bookingId),

      transactionCode:
        transactionCode,

      amount:
        Number(total),
    };

    console.log(
      "SUBMITTING MANUAL M-PESA PAYMENT:",
      payload
    );

    try {

      const response =
        await api.post(
          "/api/mpesa/manual-payment",
          payload
        );

      console.log(
        "MANUAL M-PESA RESPONSE:",
        response.data
      );

      return response;

    } catch (err) {

      console.error(
        "MANUAL M-PESA PAYMENT ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data
      );

      throw err;
    }
  };

  // ============================================================
  // COPY TILL
  // ============================================================

  const copyTillNumber =
    async () => {

      try {

        await navigator.clipboard.writeText(
          MPESA_TILL_NUMBER
        );

        setPaymentMessage(
          "Till Number copied successfully."
        );

        setTimeout(() => {
          setPaymentMessage("");
        }, 3000);

      } catch (err) {

        console.error(
          "COPY ERROR:",
          err
        );

        setPaymentMessage(
          `Till Number: ${MPESA_TILL_NUMBER}`
        );
      }
    };

  // ============================================================
  // FORMAT CARD NUMBER
  // ============================================================

  const formatCardNumber =
    (value) => {

      const cleaned =
        value
          .replace(/\D/g, "")
          .slice(0, 16);

      return cleaned
        .replace(
          /(.{4})/g,
          "$1 "
        )
        .trim();
    };

  // ============================================================
  // FORMAT EXPIRY
  // ============================================================

  const formatExpiry =
    (value) => {

      const cleaned =
        value
          .replace(/\D/g, "")
          .slice(0, 4);

      if (
        cleaned.length >= 3
      ) {
        return `${cleaned.slice(
          0,
          2
        )}/${cleaned.slice(2)}`;
      }

      return cleaned;
    };

  // ============================================================
  // SUCCESS PAGE
  // ============================================================

  const goToSuccess = (
    bookingResponse,
    paymentResponse = null
  ) => {

    const bookingId =
      getBookingId(
        bookingResponse
      );

    const savedBooking =
      bookingResponse?.data?.booking ||
      booking;

    navigate(
      "/success",
      {
        state: {

          booking:
            savedBooking,

          bookingId:
            bookingId,

          total:
            Number(total),

          paymentMethod:
            paymentMethod === "mpesa"
              ? "mpesa_till"
              : paymentMethod,

          paymentStatus:
            paymentMethod === "mpesa"
              ? "Awaiting Verification"
              : "Pending",

          transactionCode:
            paymentMethod === "mpesa"
              ? mpesaTransactionCode
                  .trim()
                  .toUpperCase()
              : "",

          paymentResponse:
            paymentResponse?.data ||
            null,

          message:
            paymentMethod === "mpesa"
              ? "Your booking has been received. Your M-PESA payment is awaiting verification by our administrator."
              : paymentMethod === "cash"
              ? "Your booking has been received. Payment will be made in cash."
              : "Your booking has been submitted.",
        },
      }
    );
  };

  // ============================================================
  // HANDLE PAYMENT
  // ============================================================

  const handlePayment =
    async (event) => {

      event.preventDefault();

      setError("");

      setPaymentMessage("");

      // --------------------------------------------------------
      // BOOKING CHECK
      // --------------------------------------------------------

      if (!booking) {

        setError(
          "Booking information is missing. Please return to the booking page."
        );

        return;
      }

      // --------------------------------------------------------
      // TOTAL CHECK
      // --------------------------------------------------------

      if (
        !Number.isFinite(total) ||
        total <= 0
      ) {

        setError(
          "The booking amount is invalid. Please return to the booking page."
        );

        return;
      }

      // --------------------------------------------------------
      // M-PESA VALIDATION
      // --------------------------------------------------------

      if (
        paymentMethod === "mpesa"
      ) {

        const transactionCode =
          mpesaTransactionCode
            .trim()
            .toUpperCase();

        if (!transactionCode) {

          setError(
            "Please make the M-PESA payment first, then enter the transaction code."
          );

          return;
        }

        if (
          transactionCode.length < 5
        ) {

          setError(
            "The M-PESA transaction code appears too short. Please check it."
          );

          return;
        }
      }

      // --------------------------------------------------------
      // CARD
      // --------------------------------------------------------

      if (
        paymentMethod === "card"
      ) {

        setError(
          "Card payments are not connected yet. Please use M-PESA or Cash."
        );

        return;
      }

      setProcessing(true);

      try {

        // ======================================================
        // STEP 1 — CREATE BOOKING
        // ======================================================

        setPaymentMessage(
          "Creating your booking..."
        );

        const bookingResponse =
          await createBooking();

        const bookingId =
          getBookingId(
            bookingResponse
          );

        console.log(
          "NEW BOOKING ID:",
          bookingId
        );

        if (!bookingId) {

          throw new Error(
            "The booking was created but the server did not return a booking ID."
          );
        }

        // ======================================================
        // STEP 2 — M-PESA
        // ======================================================

        if (
          paymentMethod === "mpesa"
        ) {

          setPaymentMessage(
            "Submitting your M-PESA transaction code..."
          );

          const paymentResponse =
            await submitMpesaPayment(
              bookingId
            );

          setPaymentMessage(
            "Payment submitted for verification."
          );

          goToSuccess(
            bookingResponse,
            paymentResponse
          );

          return;
        }

        // ======================================================
        // STEP 3 — CASH
        // ======================================================

        if (
          paymentMethod === "cash"
        ) {

          setPaymentMessage(
            "Booking created successfully."
          );

          goToSuccess(
            bookingResponse
          );

          return;
        }

      } catch (err) {

        console.error(
          "PAYMENT ERROR:",
          err
        );

        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.msg;

        const statusCode =
          err?.response?.status;

        if (
          statusCode === 400
        ) {

          setError(
            backendMessage ||
            "The server rejected the booking. Please check the selected service, category, date, time and amount."
          );

        } else if (
          statusCode === 401
        ) {

          setError(
            "Your login session has expired. Please log in again."
          );

        } else if (
          statusCode === 403
        ) {

          setError(
            "You are not authorized to perform this action."
          );

        } else if (
          statusCode === 404
        ) {

          setError(
            backendMessage ||
            "The requested backend endpoint was not found."
          );

        } else if (
          statusCode >= 500
        ) {

          setError(
            backendMessage ||
            "The server encountered an error. Check the Flask terminal for details."
          );

        } else {

          setError(
            backendMessage ||
            err?.message ||
            "Something went wrong while processing your booking."
          );
        }

      } finally {

        setProcessing(false);
      }
    };

  // ============================================================
  // NO BOOKING
  // ============================================================

  if (!booking) {

    return (
      <div className="payment-page">

        <div className="payment-container">

          <div className="payment-card">

            <div className="payment-header">

              <h1>
                Payment
              </h1>

              <p>
                No booking information was found.
              </p>

            </div>

            <div className="payment-error">

              Please return to the booking page and
              select your service again.

            </div>

            <button
              type="button"
              className="payment-back-button"
              onClick={() =>
                navigate(-1)
              }
            >
              ← Back to Booking
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="payment-page">

      <div className="payment-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="payment-header">

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Choose your preferred payment method
            to complete your booking.
          </p>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="payment-error">

            <strong>
              Payment Error
            </strong>

            <p>
              {error}
            </p>

          </div>
        )}

        {/* =====================================================
            MESSAGE
        ====================================================== */}

        {paymentMessage && (
          <div className="payment-message">
            {paymentMessage}
          </div>
        )}

        <div className="payment-layout">

          {/* ===================================================
              PAYMENT METHODS
          ==================================================== */}

          <div className="payment-card">

            <h2>
              Payment Method
            </h2>

            <div className="payment-methods">

              {/* =================================================
                  M-PESA
              ================================================== */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "mpesa"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setPaymentMethod(
                    "mpesa"
                  );
                  setError("");
                }}
              >

                <div className="payment-method-icon">
                  M
                </div>

                <div className="payment-method-info">

                  <strong>
                    M-PESA
                  </strong>

                  <span>
                    Pay using our Till Number
                  </span>

                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "mpesa"
                    ? "●"
                    : "○"}

                </div>

              </button>

              {/* =================================================
                  CARD
              ================================================== */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "card"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setPaymentMethod(
                    "card"
                  );
                  setError("");
                }}
              >

                <div className="payment-method-icon">
                  💳
                </div>

                <div className="payment-method-info">

                  <strong>
                    Card
                  </strong>

                  <span>
                    Debit or credit card
                  </span>

                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "card"
                    ? "●"
                    : "○"}

                </div>

              </button>

              {/* =================================================
                  CASH
              ================================================== */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "cash"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setPaymentMethod(
                    "cash"
                  );
                  setError("");
                }}
              >

                <div className="payment-method-icon">
                  💵
                </div>

                <div className="payment-method-info">

                  <strong>
                    Cash
                  </strong>

                  <span>
                    Pay in cash
                  </span>

                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "cash"
                    ? "●"
                    : "○"}

                </div>

              </button>

            </div>

            {/* ==================================================
                M-PESA PANEL
            =================================================== */}

            {paymentMethod === "mpesa" && (

              <div className="mpesa-payment-panel">

                <h3>
                  Pay with M-PESA
                </h3>

                <p>
                  Use the M-PESA menu on your phone
                  to pay the amount shown below.
                </p>

                <div className="mpesa-payment-box">

                  <span>
                    Till Number
                  </span>

                  <strong>
                    {MPESA_TILL_NUMBER}
                  </strong>

                  <button
                    type="button"
                    onClick={
                      copyTillNumber
                    }
                  >
                    Copy Till Number
                  </button>

                </div>

                <div className="mpesa-payment-box">

                  <span>
                    Amount
                  </span>

                  <strong>
                    KSh{" "}
                    {total.toLocaleString(
                      "en-KE"
                    )}
                  </strong>

                </div>

                <div className="form-group">

                  <label htmlFor="mpesaTransactionCode">
                    M-PESA Transaction Code
                  </label>

                  <input
                    id="mpesaTransactionCode"
                    type="text"
                    value={
                      mpesaTransactionCode
                    }
                    onChange={(event) =>
                      setMpesaTransactionCode(
                        event.target.value
                          .toUpperCase()
                          .replace(
                            /\s/g,
                            ""
                          )
                      )
                    }
                    placeholder="Enter transaction code"
                    maxLength={30}
                    autoComplete="off"
                  />

                  <small>
                    Enter the transaction code from
                    your M-PESA confirmation message.
                  </small>

                </div>

                <div className="mpesa-instructions">

                  <strong>
                    How to pay
                  </strong>

                  <ol>

                    <li>
                      Open M-PESA on your phone.
                    </li>

                    <li>
                      Select Lipa na M-PESA.
                    </li>

                    <li>
                      Select Buy Goods and Services.
                    </li>

                    <li>
                      Enter the Till Number:
                      <strong>
                        {" "}
                        {MPESA_TILL_NUMBER}
                      </strong>
                    </li>

                    <li>
                      Enter the amount:
                      <strong>
                        {" "}
                        KSh{" "}
                        {total.toLocaleString(
                          "en-KE"
                        )}
                      </strong>
                    </li>

                    <li>
                      Complete the payment.
                    </li>

                    <li>
                      Enter the M-PESA transaction
                      code above.
                    </li>

                  </ol>

                </div>

              </div>

            )}

            {/* ==================================================
                CARD PANEL
            =================================================== */}

            {paymentMethod === "card" && (

              <div className="card-payment-panel">

                <div className="form-group">

                  <label>
                    Card Number
                  </label>

                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(
                        formatCardNumber(
                          event.target.value
                        )
                      )
                    }
                    placeholder="0000 0000 0000 0000"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Name on Card
                  </label>

                  <input
                    type="text"
                    value={cardName}
                    onChange={(event) =>
                      setCardName(
                        event.target.value
                      )
                    }
                    placeholder="Name on card"
                  />

                </div>

                <div className="card-row">

                  <div className="form-group">

                    <label>
                      Expiry
                    </label>

                    <input
                      type="text"
                      value={expiry}
                      onChange={(event) =>
                        setExpiry(
                          formatExpiry(
                            event.target.value
                          )
                        )
                      }
                      placeholder="MM/YY"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      value={cvv}
                      onChange={(event) =>
                        setCvv(
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              4
                            )
                        )
                      }
                      placeholder="CVV"
                    />

                  </div>

                </div>

                <div className="payment-warning">

                  Card payments are not connected yet.
                  Please use M-PESA or Cash.

                </div>

              </div>

            )}

            {/* ==================================================
                CASH PANEL
            =================================================== */}

            {paymentMethod === "cash" && (

              <div className="cash-payment-panel">

                <h3>
                  Cash Payment
                </h3>

                <p>
                  Your booking will be created with
                  payment status set to Pending.
                  Payment can be made in cash as
                  agreed with the service provider.
                </p>

              </div>

            )}

          </div>

          {/* ===================================================
              ORDER SUMMARY
          ==================================================== */}

          <div className="payment-card payment-summary">

            <h2>
              Booking Summary
            </h2>

            <div className="summary-row">

              <span>
                Service
              </span>

              <strong>
                {booking.serviceName ||
                  booking.service?.title ||
                  "Selected Service"}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Category
              </span>

              <strong>
                {booking.categoryName ||
                  "Service"}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Date
              </span>

              <strong>
                {booking.date ||
                  "Not selected"}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Time
              </span>

              <strong>
                {booking.time ||
                  "Not selected"}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Location
              </span>

              <strong>
                {booking.address ||
                  booking.estate ||
                  "Not provided"}
              </strong>

            </div>

            <div className="summary-divider" />

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                KSh{" "}
                {total.toLocaleString(
                  "en-KE"
                )}
              </strong>

            </div>

            <button
              type="button"
              className="pay-button"
              disabled={processing}
              onClick={
                handlePayment
              }
            >

              {processing
                ? "Processing..."
                : paymentMethod === "mpesa"
                ? "Submit M-PESA Payment"
                : paymentMethod === "cash"
                ? "Confirm Booking"
                : "Continue"}

            </button>

            <button
              type="button"
              className="back-button"
              disabled={processing}
              onClick={() =>
                navigate(-1)
              }
            >
              ← Back
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Payment;