import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // GET BOOKING DATA FROM CHECKOUT
  // ==========================================

  const booking = location.state?.booking;
  const total = location.state?.total || 0;

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

  // ==========================================
  // CHANGE PAYMENT METHOD
  // ==========================================

  const changePaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  // ==========================================
  // HANDLE PAYMENT
  // ==========================================

  const handlePayment = (e) => {
    e.preventDefault();

    // ------------------------------------------
    // MAKE SURE BOOKING EXISTS
    // ------------------------------------------

    if (!booking) {
      alert("Booking information is missing. Please return to booking.");
      navigate("/services");
      return;
    }

    // ------------------------------------------
    // M-PESA VALIDATION
    // ------------------------------------------

    if (paymentMethod === "mpesa") {
      if (!phone.trim()) {
        alert("Please enter your M-Pesa phone number.");
        return;
      }

      if (!/^07\d{8}$/.test(phone)) {
        alert(
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
        alert("Please complete all card details.");
        return;
      }
    }

    // ------------------------------------------
    // START PROCESSING
    // ------------------------------------------

    setProcessing(true);

    /*
      This is currently a simulated payment.

      Later you can replace this section with
      your Flask payment API / M-Pesa integration.
    */

    setTimeout(() => {
      setProcessing(false);

      navigate("/success", {
        state: {
          booking: booking,
          total: total,
          paymentMethod: paymentMethod
        }
      });
    }, 1200);
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

          <h1>Booking Not Found</h1>

          <p>
            We could not find your booking information.
            Please return to the services page and make a booking.
          </p>

          <button
            className="back-button"
            onClick={() => navigate("/services")}
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

          <h1>Complete Payment</h1>

          <p>
            Securely complete your service booking.
          </p>

        </div>


        {/* =====================================
            ORDER SUMMARY
        ====================================== */}

        <div className="payment-summary">

          <h2>
            🧾 Booking Summary
          </h2>

          {booking.serviceName && (
            <div className="summary-row">
              <span>Service</span>
              <strong>
                {booking.serviceName}
              </strong>
            </div>
          )}

          {booking.cleaningType && (
            <div className="summary-row">
              <span>Service Type</span>
              <strong>
                {booking.cleaningType}
              </strong>
            </div>
          )}

          {booking.houseSize && (
            <div className="summary-row">
              <span>House Size</span>
              <strong>
                {booking.houseSize}
              </strong>
            </div>
          )}

          {booking.frequency && (
            <div className="summary-row">
              <span>Frequency</span>
              <strong>
                {booking.frequency}
              </strong>
            </div>
          )}

          {booking.date && (
            <div className="summary-row">
              <span>Date</span>
              <strong>
                {booking.date}
              </strong>
            </div>
          )}

          {booking.time && (
            <div className="summary-row">
              <span>Time</span>
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
              Ksh {Number(total).toLocaleString()}
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
                changePaymentMethod("mpesa")
              }
            >

              <span className="payment-option-icon">
                📱
              </span>

              <span>
                <strong>M-Pesa</strong>
                <small>
                  Pay using your mobile phone
                </small>
              </span>

              <span className="radio-circle">
                {paymentMethod === "mpesa" && "✓"}
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
                changePaymentMethod("card")
              }
            >

              <span className="payment-option-icon">
                💳
              </span>

              <span>
                <strong>Debit / Credit Card</strong>
                <small>
                  Pay securely using your card
                </small>
              </span>

              <span className="radio-circle">
                {paymentMethod === "card" && "✓"}
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
                changePaymentMethod("cash")
              }
            >

              <span className="payment-option-icon">
                💵
              </span>

              <span>
                <strong>Cash on Service</strong>
                <small>
                  Pay the provider after service
                </small>
              </span>

              <span className="radio-circle">
                {paymentMethod === "cash" && "✓"}
              </span>

            </button>

          </div>


          {/* ===================================
              M-PESA FORM
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
                  setPhone(e.target.value)
                }
                required
              />

              <p className="payment-hint">
                An M-Pesa payment request will
                be sent to this number.
              </p>

            </div>

          )}


          {/* ===================================
              CARD FORM
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
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value)
                }
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
                  setCardName(e.target.value)
                }
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
                      setExpiry(e.target.value)
                    }
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
                      setCvv(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <p className="payment-hint">
                🔒 Your payment information is
                handled securely.
              </p>

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
              onClick={() => navigate(-1)}
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
                  Processing...
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