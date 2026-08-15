import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Success.css";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;
  const total = location.state?.total || 0;
  const paymentMethod = location.state?.paymentMethod;
  const bookingId = location.state?.bookingId || "RM-PENDING";

  return (
    <div className="success-container">

      <div className="success-card">

        {/* SUCCESS ICON */}
        <div className="success-icon">
          ✓
        </div>

        <h1>Booking Confirmed!</h1>

        <p className="success-message">
          Thank you for choosing{" "}
          <strong>Ramon's Service Marketplace.</strong>
        </p>

        <div className="success-badge">
          Booking Successfully Received
        </div>

        <hr />

        {/* BOOKING DETAILS */}
        <h2>Booking Details</h2>

        <div className="booking-reference">
          <span>Booking Reference</span>
          <strong>{bookingId}</strong>
        </div>

        {booking ? (
          <div className="booking-details">

            {/* SERVICE */}
            {booking.serviceName && (
              <div className="detail-row">
                <span>Service</span>
                <strong>{booking.serviceName}</strong>
              </div>
            )}

            {/* HOUSE SIZE */}
            {booking.houseSize && (
              <div className="detail-row">
                <span>House Size</span>
                <strong>{booking.houseSize}</strong>
              </div>
            )}

            {/* CLEANING TYPE */}
            {booking.cleaningType && (
              <div className="detail-row">
                <span>Service Type</span>
                <strong>{booking.cleaningType}</strong>
              </div>
            )}

            {/* FREQUENCY */}
            {booking.frequency && (
              <div className="detail-row">
                <span>Frequency</span>
                <strong>{booking.frequency}</strong>
              </div>
            )}

            {/* DATE */}
            {booking.date && (
              <div className="detail-row">
                <span>Date</span>
                <strong>{booking.date}</strong>
              </div>
            )}

            {/* TIME */}
            {booking.time && (
              <div className="detail-row">
                <span>Time</span>
                <strong>{booking.time}</strong>
              </div>
            )}

            {/* ADDRESS */}
            {booking.address && (
              <div className="detail-row">
                <span>Address</span>
                <strong>{booking.address}</strong>
              </div>
            )}

            {/* CITY */}
            {booking.city && (
              <div className="detail-row">
                <span>City</span>
                <strong>{booking.city}</strong>
              </div>
            )}

            {/* ESTATE */}
            {booking.estate && (
              <div className="detail-row">
                <span>Estate</span>
                <strong>{booking.estate}</strong>
              </div>
            )}

            {/* HOUSE NUMBER */}
            {booking.houseNumber && (
              <div className="detail-row">
                <span>House Number</span>
                <strong>{booking.houseNumber}</strong>
              </div>
            )}

            {/* NOTES */}
            {booking.notes && (
              <div className="detail-row detail-notes">
                <span>Special Instructions</span>
                <strong>{booking.notes}</strong>
              </div>
            )}

          </div>
        ) : (
          <div className="no-booking">
            <p>
              No booking information is available.
            </p>
          </div>
        )}

        {/* PAYMENT */}
        <div className="payment-confirmation">

          <div className="detail-row">

            <span>
              Payment Method
            </span>

            <strong>
              {paymentMethod || "Not Provided"}
            </strong>

          </div>

        </div>

        {/* TOTAL */}
        <div className="total-section">

          <p>Total Amount</p>

          <h1>
            Ksh {Number(total).toLocaleString()}
          </h1>

          <span>
            Payment successfully processed
          </span>

        </div>

        <hr />

        {/* WHAT HAPPENS NEXT */}
        <div className="next-section">

          <h2>
            What Happens Next?
          </h2>

          <div className="next-step">
            <span>1</span>
            <p>
              Your booking has been received.
            </p>
          </div>

          <div className="next-step">
            <span>2</span>
            <p>
              Your payment details have been recorded.
            </p>
          </div>

          <div className="next-step">
            <span>3</span>
            <p>
              A qualified service provider will be assigned.
            </p>
          </div>

          <div className="next-step">
            <span>4</span>
            <p>
              You will receive booking updates.
            </p>
          </div>

          <div className="next-step">
            <span>5</span>
            <p>
              The provider will arrive on your selected date
              and time.
            </p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="success-buttons">

          <button
            className="home-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

          <button
            className="service-button"
            onClick={() => navigate("/services")}
          >
            Book Another Service →
          </button>

        </div>

      </div>

    </div>
  );
}

export default Success;