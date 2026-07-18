import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "./Payment.css";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Booking data passed from Checkout.jsx
  const booking = location.state?.booking;
  const total = location.state?.total || 0;
  

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  

  const handlePayment = () => {
    // Later this will call your Flask backend for M-Pesa/Card payment

    alert(`Payment of Ksh ${total} initiated using ${paymentMethod}.`);

    navigate("/success", {
      state: {
        booking,
        total,
        paymentMethod,
        // bookingId,
      },
    });
  };

  return (
    <div className="payment-container">

      <h1>Payment</h1>

      <p>Complete your booking by selecting a payment method.</p>

      <div className="payment-summary">

        <h2>Order Summary</h2>

        <p><strong>Total Amount:</strong> Ksh {total}</p>

      </div>

      <h2>Select Payment Method</h2>

      <label className="payment-option">
        <input
          type="radio"
          value="mpesa"
          checked={paymentMethod === "mpesa"}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        M-Pesa
      </label>

      <label className="payment-option">
        <input
          type="radio"
          value="card"
          checked={paymentMethod === "card"}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Debit / Credit Card
      </label>

      <label className="payment-option">
        <input
          type="radio"
          value="cash"
          checked={paymentMethod === "cash"}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Cash on Service
      </label>

      {paymentMethod === "mpesa" && (
        <div className="payment-form">

          <h3>M-Pesa Payment</h3>

          <input
            type="tel"
            placeholder="07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <p>
            An M-Pesa payment request will be sent to your phone.
          </p>

        </div>
      )}

      {paymentMethod === "card" && (
        <div className="payment-form">

          <input
            type="text"
            placeholder="Card Number"
          />

          <input
            type="text"
            placeholder="Card Holder Name"
          />

          <input
            type="text"
            placeholder="MM/YY"
          />

          <input
            type="password"
            placeholder="CVV"
          />

        </div>
      )}

      {paymentMethod === "cash" && (
        <div className="payment-form">

          <p>
            You will pay the service provider after the service has been completed.
          </p>

        </div>
      )}

      <button
        className="pay-button"
        onClick={handlePayment}
      >
        Confirm Payment
      </button>

    </div>
  );
}

export default Payment;