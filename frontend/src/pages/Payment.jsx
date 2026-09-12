import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Payment.css";

const MPESA_TILL_NUMBER =
  import.meta.env.VITE_MPESA_TILL_NUMBER || "1699138";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  const total = Number(
    location.state?.total ??
      booking?.total ??
      0
  );

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

  /*
   * Show the detailed booking summary only
   * after the customer enters an M-PESA
   * transaction code.
   */
  const showBookingSummary =
    paymentMethod === "mpesa" &&
    mpesaTransactionCode.trim().length > 0;

  /* =====================================================
     SERVICE HELPERS
  ===================================================== */

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

  const getServiceName = () => {
    return (
      booking?.serviceName ||
      booking?.service_name ||
      booking?.service?.name ||
      booking?.service?.title ||
      booking?.category?.serviceName ||
      booking?.category?.name ||
      "Cleaning Service"
    );
  };

  const getExtras = () => {
    if (!Array.isArray(booking?.extras)) {
      return [];
    }

    return booking.extras;
  };

  const formatExtra = (extra) => {
    if (typeof extra === "string") {
      return extra;
    }

    if (extra && typeof extra === "object") {
      return (
        extra.name ||
        extra.label ||
        extra.title ||
        extra.description ||
        "Additional service"
      );
    }

    return "Additional service";
  };

  /* =====================================================
     CREATE BOOKING
  ===================================================== */

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

    const payload = {
      serviceId,
      categoryId,
      total: Number(total),

      date: booking.date || "",
      time: booking.time || "",

      address: booking.address || "",
      city: booking.city || "",
      estate: booking.estate || "",
      houseNumber: booking.houseNumber || "",

      houseSize: booking.houseSize || "",

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

      paymentPhone: "",
    };

    console.log(
      "======================================"
    );

    console.log("CREATING BOOKING");

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

  /* =====================================================
     GET BOOKING ID
  ===================================================== */

  const getBookingId = (response) => {
    return (
      response?.data?.booking?.id ??
      response?.data?.id ??
      response?.data?.bookingId ??
      response?.data?.booking_id ??
      null
    );
  };

  /* =====================================================
     SUBMIT M-PESA PAYMENT
  ===================================================== */

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
      bookingId: Number(bookingId),
      transactionCode,
      amount: Number(total),
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

  /* =====================================================
     COPY TILL NUMBER
  ===================================================== */

  const copyTillNumber = async () => {
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

  /* =====================================================
     CARD FORMATTERS
  ===================================================== */

  const formatCardNumber = (value) => {
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

  const formatExpiry = (value) => {
    const cleaned =
      value
        .replace(/\D/g, "")
        .slice(0, 4);

    if (cleaned.length >= 3) {
      return `${cleaned.slice(
        0,
        2
      )}/${cleaned.slice(2)}`;
    }

    return cleaned;
  };

  /* =====================================================
     SUCCESS PAGE
  ===================================================== */

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
          booking: savedBooking,

          bookingId,

          total: Number(total),

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

  /* =====================================================
     HANDLE PAYMENT
  ===================================================== */

  const handlePayment = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setPaymentMessage("");

    if (!booking) {
      setError(
        "Booking information is missing. Please return to the booking page."
      );

      return;
    }

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setError(
        "The booking amount is invalid. Please return to the booking page."
      );

      return;
    }

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

  /* =====================================================
     DIRECT PAYMENT PAGE ACCESS
  ===================================================== */

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

            <div className="payment-error-message">

              Please return to the booking page
              and select your service again.

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

  /* =====================================================
     MAIN PAYMENT PAGE
  ===================================================== */

  return (
    <div className="payment-page">

      <div className="payment-container">

        <div className="payment-header">

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Choose your preferred payment method
            to complete your booking.
          </p>

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="payment-error-message">

            <strong>
              Payment Error
            </strong>

            <p>
              {error}
            </p>

          </div>
        )}

        {/* SUCCESS / INFO MESSAGE */}

        {paymentMessage && (
          <div className="payment-success-message">
            {paymentMessage}
          </div>
        )}

        {/* =================================================
            SINGLE PAYMENT COLUMN
        ================================================== */}

        <div className="payment-layout single-payment-column">

          <div className="payment-card">

            <h2>
              Payment Method
            </h2>

            <p>
              Select how you would like to pay
              for your booking.
            </p>

            {/* =================================================
                PAYMENT METHOD SELECTOR
            ================================================== */}

            <div className="payment-methods">

              {/* M-PESA */}

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
                  setPaymentMessage("");
                }}
              >

                <div className="payment-method-icon">
                  📱
                </div>

                <div className="payment-method-text">
                  M-PESA
                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "mpesa"
                    ? "●"
                    : "○"}

                </div>

              </button>

              {/* CARD */}

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
                  setPaymentMessage("");
                }}
              >

                <div className="payment-method-icon">
                  💳
                </div>

                <div className="payment-method-text">
                  Card
                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "card"
                    ? "●"
                    : "○"}

                </div>

              </button>

              {/* CASH */}

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
                  setPaymentMessage("");
                }}
              >

                <div className="payment-method-icon">
                  💵
                </div>

                <div className="payment-method-text">
                  Cash
                </div>

                <div className="payment-method-radio">

                  {paymentMethod === "cash"
                    ? "●"
                    : "○"}

                </div>

              </button>

            </div>

            {/* =================================================
                M-PESA
            ================================================== */}

            {paymentMethod === "mpesa" && (
              <div className="mpesa-section">

                <h3>
                  Pay with M-PESA
                </h3>

                <p>
                  Follow the steps below to make
                  your payment, then enter your
                  M-PESA transaction code.
                </p>

                {/* HOW TO PAY */}

                <div className="mpesa-instructions">

                  <h4>
                    How to Pay
                  </h4>

                  <ol>

                    <li>
                      Open M-PESA on your phone.
                    </li>

                    <li>
                      Select
                      <strong>
                        {" "}Lipa na M-PESA
                      </strong>.
                    </li>

                    <li>
                      Select
                      <strong>
                        {" "}Buy Goods and Services
                      </strong>.
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
                      Confirm and complete
                      the payment.
                    </li>

                    <li>
                      Enter the transaction
                      code below.
                    </li>

                  </ol>

                </div>

                {/* =================================================
                    TILL NUMBER
                ================================================== */}

                <div className="mpesa-till">

                  <span className="mpesa-till-label">
                    M-PESA Till Number
                  </span>

                  <div className="mpesa-till-number">
                    {MPESA_TILL_NUMBER}
                  </div>

                  <button
                    type="button"
                    className="mpesa-copy-button"
                    onClick={
                      copyTillNumber
                    }
                  >
                    📋 Copy Till Number
                  </button>

                </div>

                {/* SECURITY MESSAGE */}

                <div className="mpesa-security">

                  <span>
                    🔒
                  </span>

                  <div>
                    <strong>
                      Secure Payment
                    </strong>
                    <br />
                    Only enter the transaction
                    code shown in your official
                    M-PESA confirmation message.
                  </div>

                </div>

                {/* =================================================
                    TRANSACTION CODE
                ================================================== */}

                <label
                  htmlFor="mpesaTransactionCode"
                  className="mpesa-transaction-label"
                >
                  M-PESA Transaction Code
                </label>

                <input
                  id="mpesaTransactionCode"
                  type="text"
                  className="mpesa-transaction-input"
                  value={
                    mpesaTransactionCode
                  }
                  onChange={(event) => {

                    const value =
                      event.target.value
                        .toUpperCase()
                        .replace(
                          /\s/g,
                          ""
                        );

                    setMpesaTransactionCode(
                      value
                    );

                    setError("");
                  }}
                  placeholder="Enter transaction code"
                  maxLength={30}
                  autoComplete="off"
                />

                {/* =================================================
                    BOOKING SUMMARY
                ================================================== */}

                {showBookingSummary && (
                  <div className="booking-summary-card">

                    <h3>
                      Review Your Booking
                    </h3>

                    {/* SERVICE */}

                    <div className="booking-summary-row">

                      <span>
                        Service
                      </span>

                      <span>
                        {getServiceName()}
                      </span>

                    </div>

                    {/* HOUSE SIZE */}

                    <div className="booking-summary-row">

                      <span>
                        House Size
                      </span>

                      <span>
                        {booking.houseSize ||
                          "Not selected"}
                      </span>

                    </div>

                    {/* CLEANING TYPE */}

                    <div className="booking-summary-row">

                      <span>
                        Cleaning Type
                      </span>

                      <span>
                        {booking.cleaningType ||
                          booking.cleaningLevel ||
                          "Standard"}
                      </span>

                    </div>

                    {/* FREQUENCY */}

                    <div className="booking-summary-row">

                      <span>
                        Frequency
                      </span>

                      <span>
                        {booking.frequency ||
                          "One-Time"}
                      </span>

                    </div>

                    {/* DATE */}

                    <div className="booking-summary-row">

                      <span>
                        Date
                      </span>

                      <span>
                        {booking.date ||
                          "Not selected"}
                      </span>

                    </div>

                    {/* TIME */}

                    <div className="booking-summary-row">

                      <span>
                        Time
                      </span>

                      <span>
                        {booking.time ||
                          "Not selected"}
                      </span>

                    </div>

                    {/* LOCATION */}

                    <div className="booking-summary-row">

                      <span>
                        Location
                      </span>

                      <span>
                        {booking.address ||
                          booking.estate ||
                          booking.city ||
                          "Not provided"}
                      </span>

                    </div>

                    {/* HOUSE NUMBER */}

                    {booking.houseNumber && (
                      <div className="booking-summary-row">

                        <span>
                          House Number
                        </span>

                        <span>
                          {booking.houseNumber}
                        </span>

                      </div>
                    )}

                    {/* EXTRAS */}

                    <div className="booking-summary-row">

                      <span>
                        Extras
                      </span>

                      <span>

                        {getExtras().length > 0
                          ? getExtras()
                              .map(
                                (
                                  extra,
                                  index
                                ) => (
                                  <span
                                    key={`${formatExtra(
                                      extra
                                    )}-${index}`}
                                  >
                                    {formatExtra(
                                      extra
                                    )}
                                    {index <
                                    getExtras()
                                      .length -
                                      1
                                      ? ", "
                                      : ""}
                                  </span>
                                )
                              )
                          : "None"}

                      </span>

                    </div>

                    {/* TOTAL */}

                    <div className="booking-summary-row booking-summary-total">

                      <span>
                        Total Amount
                      </span>

                      <span>
                        KSh{" "}
                        {total.toLocaleString(
                          "en-KE"
                        )}
                      </span>

                    </div>

                    {/* CONFIRM */}

                    <button
                      type="button"
                      className="payment-submit-button"
                      disabled={
                        processing ||
                        mpesaTransactionCode.trim()
                          .length < 5
                      }
                      onClick={
                        handlePayment
                      }
                    >

                      {processing
                        ? "Processing..."
                        : "Confirm M-PESA Payment"}

                    </button>

                  </div>
                )}

              </div>
            )}

            {/* =================================================
                CARD
            ================================================== */}

            {paymentMethod === "card" && (
              <div className="card-payment-panel">

                <div className="payment-form-group">

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

                <div className="payment-form-group">

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

                <div className="payment-form-group">

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

                <div className="payment-form-group">

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

                <div className="payment-error-message">

                  Card payments are not connected
                  yet. Please use M-PESA or Cash.

                </div>

              </div>
            )}

            {/* =================================================
                CASH
            ================================================== */}

            {paymentMethod === "cash" && (
              <div className="cash-payment-message">

                <strong>
                  Cash Payment
                </strong>

                Your booking will be created with
                payment status set to Pending.
                Payment can be made in cash as
                agreed with the service provider.

                <button
                  type="button"
                  className="payment-submit-button"
                  disabled={processing}
                  onClick={
                    handlePayment
                  }
                >

                  {processing
                    ? "Processing..."
                    : "Confirm Cash Booking"}

                </button>

              </div>
            )}

            {/* =================================================
                BACK BUTTON
            ================================================== */}

            <button
              type="button"
              className="payment-back-button"
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