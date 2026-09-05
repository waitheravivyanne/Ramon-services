import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../api/axios";
import "../styles/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // GET BOOKING DATA
  // ==========================================

  const booking = location.state?.booking;
  const total = Number(location.state?.total ?? booking?.total ?? 0);

  // ==========================================
  // PAYMENT STATE
  // ==========================================

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // CHANGE PAYMENT METHOD
  // ==========================================

  const changePaymentMethod = (method) => {
    setPaymentMethod(method);
    setError("");
  };

  // ==========================================
  // CREATE BOOKING
  // ==========================================

  const createBooking = async () => {
    if (!booking) {
      throw new Error("Booking information is missing.");
    }

    // ------------------------------------------
    // GET IDS
    // ------------------------------------------

    const serviceId = Number(
      booking.serviceId
    );

    const categoryId = Number(
      booking.categoryId
    );

    // ------------------------------------------
    // VALIDATE REQUIRED IDS
    // ------------------------------------------

    if (!serviceId || Number.isNaN(serviceId)) {
      throw new Error(
        "Service ID is missing from the booking."
      );
    }

    if (!categoryId || Number.isNaN(categoryId)) {
      throw new Error(
        "Category ID is missing from the booking."
      );
    }

    // ------------------------------------------
    // PREPARE EXTRAS
    // ------------------------------------------

    const extras =
      booking.extras ||
      booking.cleaningExtras ||
      [];

    // ------------------------------------------
    // PREPARE DATA FOR FLASK
    // ------------------------------------------

    const bookingData = {
      serviceId: serviceId,

      categoryId: categoryId,

      total: total,

      date: booking.date || "",

      time: booking.time || "",

      address: booking.address || "",

      city: booking.city || "",

      estate: booking.estate || "",

      houseNumber:
        booking.houseNumber || "",

      // ----------------------------------------
      // CLEANING
      // ----------------------------------------

      houseSize:
        booking.houseSize || "",

      cleaningType:
        booking.cleaningType ||
        booking.cleaningLevel ||
        "",

      frequency:
        booking.frequency || "",

      // ----------------------------------------
      // NOTES
      // ----------------------------------------

      notes:
        booking.notes || "",

      // ----------------------------------------
      // EXTRAS
      // ----------------------------------------

      extras: extras,

      // ----------------------------------------
      // PAYMENT INFORMATION
      // ----------------------------------------

      paymentMethod: paymentMethod,

      paymentPhone:
        paymentMethod === "mpesa"
          ? phone
          : "",
    };

    console.log(
      "================================"
    );

    console.log(
      "CREATING BOOKING..."
    );

    console.log(
      "BOOKING DATA:",
      bookingData
    );

    console.log(
      "================================"
    );

    // ------------------------------------------
    // SEND TO FLASK
    // ------------------------------------------

    const response = await api.post(
      "/bookings",
      bookingData
    );

    console.log(
      "================================"
    );

    console.log(
      "BOOKING CREATED SUCCESSFULLY:"
    );

    console.log(
      response.data
    );

    console.log(
      "================================"
    );

    return response.data;
  };

  // ==========================================
  // HANDLE PAYMENT
  // ==========================================

  const handlePayment = async (e) => {
    e.preventDefault();

    setError("");

    // ------------------------------------------
    // CHECK BOOKING
    // ------------------------------------------

    if (!booking) {
      alert(
        "Booking information is missing. Please return to booking."
      );

      navigate("/services");
      return;
    }

    // ------------------------------------------
    // CHECK TOTAL
    // ------------------------------------------

    if (total <= 0) {
      setError(
        "The booking total is invalid."
      );

      return;
    }

    // ------------------------------------------
    // M-PESA VALIDATION
    // ------------------------------------------

    if (paymentMethod === "mpesa") {
      const cleanedPhone =
        phone.replace(/\s+/g, "");

      if (!cleanedPhone) {
        setError(
          "Please enter your M-Pesa phone number."
        );

        return;
      }

      if (!/^07\d{8}$/.test(cleanedPhone)) {
        setError(
          "Please enter a valid Kenyan phone number, e.g. 0712345678."
        );

        return;
      }
    }

    // ------------------------------------------
    // CARD VALIDATION
    // ------------------------------------------

    if (paymentMethod === "card") {
      if (
        !cardNumber.trim() ||
        !cardName.trim() ||
        !expiry.trim() ||
        !cvv.trim()
      ) {
        setError(
          "Please complete all card details."
        );

        return;
      }
    }

    // ------------------------------------------
    // START PROCESSING
    // ------------------------------------------

    setProcessing(true);

    try {
      // ========================================
      // IMPORTANT
      // CREATE THE BOOKING IN DATABASE
      // ========================================

      const result =
        await createBooking();

      // ========================================
      // GO TO SUCCESS PAGE
      // ========================================

      navigate("/success", {
        state: {
          booking: result.booking || result,
          total: total,
          paymentMethod:
            paymentMethod,
        },
      });

    } catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "BOOKING FAILED"
      );

      console.error(
        "================================"
      );

      console.error(
        "Error:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "================================"
      );

      // ----------------------------------------
      // SHOW BACKEND ERROR
      // ----------------------------------------

      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error;

      setError(
        serverMessage ||
        error.message ||
        "Unable to create your booking. Please try again."
      );

    } finally {

      setProcessing(false);

    }
  };

  // ==========================================
  // NO BOOKING
  // ==========================================

  if (!booking) {
    return (
      <div className="payment-container">

        <div className="payment-card error-card">

          <div className="payment-icon">
            ⚠️
          </div>

          <h1>
            Booking Not Found
          </h1>

          <p>
            We could not find your booking
            information. Please return to the
            services page and make a booking.
          </p>

          <button
            className="back-button"
            onClick={() =>
              navigate("/services")
            }
          >
            ← Back to Services
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAYMENT PAGE
  // ==========================================

  return (
    <div className="payment-container">

      <div className="payment-card">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="payment-header">

          <div className="payment-icon">
            💳
          </div>

          <h1>
            Complete Payment
          </h1>

          <p>
            Securely complete your service booking.
          </p>

        </div>


        {/* =====================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div
            className="payment-error"
            style={{
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#ffe5e5",
              color: "#b00020",
              border: "1px solid #ffb3b3",
            }}
          >
            <strong>
              Booking failed:
            </strong>{" "}
            {error}
          </div>
        )}


        {/* =====================================
            ORDER SUMMARY
        ====================================== */}

        <div className="payment-summary">

          <h2>
            🧾 Booking Summary
          </h2>

          {booking.serviceName && (
            <div className="summary-row">

              <span>
                Service
              </span>

              <strong>
                {booking.serviceName}
              </strong>

            </div>
          )}

          {booking.categoryName && (
            <div className="summary-row">

              <span>
                Category
              </span>

              <strong>
                {booking.categoryName}
              </strong>

            </div>
          )}

          {(booking.cleaningType ||
            booking.cleaningLevel) && (
            <div className="summary-row">

              <span>
                Service Type
              </span>

              <strong>
                {booking.cleaningType ||
                  booking.cleaningLevel}
              </strong>

            </div>
          )}

          {booking.houseSize && (
            <div className="summary-row">

              <span>
                House Size
              </span>

              <strong>
                {booking.houseSize}
              </strong>

            </div>
          )}

          {booking.frequency && (
            <div className="summary-row">

              <span>
                Frequency
              </span>

              <strong>
                {booking.frequency}
              </strong>

            </div>
          )}

          {booking.date && (
            <div className="summary-row">

              <span>
                Date
              </span>

              <strong>
                {booking.date}
              </strong>

            </div>
          )}

          {booking.time && (
            <div className="summary-row">

              <span>
                Time
              </span>

              <strong>
                {booking.time}
              </strong>

            </div>
          )}

          <div className="summary-divider"></div>

          <div className="total-row">

            <span>
              Total Amount
            </span>

            <strong>
              Ksh{" "}
              {Number(
                total
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* =====================================
            PAYMENT METHOD
        ====================================== */}

        <form onSubmit={handlePayment}>

          <h2 className="section-title">
            💰 Select Payment Method
          </h2>


          <div className="payment-methods">

            {/* M-PESA */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "mpesa"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changePaymentMethod(
                  "mpesa"
                )
              }
              disabled={processing}
            >

              <span className="payment-option-icon">
                📱
              </span>

              <span>
                <strong>
                  M-Pesa
                </strong>

                <small>
                  Pay using your mobile phone
                </small>
              </span>

              <span className="radio-circle">

                {paymentMethod === "mpesa" &&
                  "✓"}

              </span>

            </button>


            {/* CARD */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "card"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changePaymentMethod(
                  "card"
                )
              }
              disabled={processing}
            >

              <span className="payment-option-icon">
                💳
              </span>

              <span>

                <strong>
                  Debit / Credit Card
                </strong>

                <small>
                  Pay securely using your card
                </small>

              </span>

              <span className="radio-circle">

                {paymentMethod === "card" &&
                  "✓"}

              </span>

            </button>


            {/* CASH */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "cash"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changePaymentMethod(
                  "cash"
                )
              }
              disabled={processing}
            >

              <span className="payment-option-icon">
                💵
              </span>

              <span>

                <strong>
                  Cash on Service
                </strong>

                <small>
                  Pay the provider after service
                </small>

              </span>

              <span className="radio-circle">

                {paymentMethod === "cash" &&
                  "✓"}

              </span>

            </button>

          </div>


          {/* ===================================
              M-PESA
          ==================================== */}

          {paymentMethod === "mpesa" && (

            <div className="payment-form">

              <h3>
                📱 M-Pesa Payment
              </h3>

              <label>
                Phone Number
                <span className="required">
                  *
                </span>
              </label>

              <input
                type="tel"
                placeholder="0712345678"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                disabled={processing}
                required
              />

              <p className="payment-hint">
                An M-Pesa payment request will
                be sent to this number.
              </p>

            </div>
          )}


          {/* ===================================
              CARD
          ==================================== */}

          {paymentMethod === "card" && (

            <div className="payment-form">

              <h3>
                💳 Card Details
              </h3>

              <label>
                Card Number
                <span className="required">
                  *
                </span>
              </label>

              <input
                type="text"
                placeholder="Card number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(
                    e.target.value
                  )
                }
                disabled={processing}
                required
              />

              <label>
                Card Holder Name
                <span className="required">
                  *
                </span>
              </label>

              <input
                type="text"
                placeholder="Enter card holder name"
                value={cardName}
                onChange={(e) =>
                  setCardName(
                    e.target.value
                  )
                }
                disabled={processing}
                required
              />

              <div className="card-row">

                <div>

                  <label>
                    Expiry Date
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(
                        e.target.value
                      )
                    }
                    disabled={processing}
                    required
                  />

                </div>

                <div>

                  <label>
                    CVV
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(
                        e.target.value
                      )
                    }
                    disabled={processing}
                    required
                  />

                </div>

              </div>

            </div>
          )}


          {/* ===================================
              CASH
          ==================================== */}

          {paymentMethod === "cash" && (

            <div className="cash-message">

              <div className="cash-icon">
                💵
              </div>

              <div>

                <h3>
                  Cash on Service
                </h3>

                <p>
                  You will pay the service provider
                  after the service has been completed.
                </p>

              </div>

            </div>
          )}


          {/* ===================================
              BUTTONS
          ==================================== */}

          <div className="payment-buttons">

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate(-1)
              }
              disabled={processing}
            >
              ← Back
            </button>


            <button
              type="submit"
              className="pay-button"
              disabled={processing}
            >

              {processing ? (
                <>
                  <span className="payment-spinner"></span>
                  Saving Booking...
                </>
              ) : (
                <>
                  Confirm Payment →
                </>
              )}

            </button>

          </div>

        </form>


        {/* =====================================
            SECURITY
        ====================================== */}

        <div className="secure-payment">

          🔒 Secure Checkout

          <span>
            Your booking information is protected.
          </span>

        </div>

      </div>

    </div>
  );
}

export default Payment;