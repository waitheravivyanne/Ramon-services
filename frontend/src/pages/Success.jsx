import { useLocation, useNavigate } from "react-router-dom";
// import "./Success.css";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;
  const total = location.state?.total;
  const paymentMethod = location.state?.paymentMethod;

  // Generate a simple booking reference
  const bookingId =
    "RM" +
    new Date().getFullYear() +
    Math.floor(Math.random() * 100000);

  return (
    <div className="success-container">

      <div className="success-card">

        <div className="success-icon">
          ✅
        </div>

        <h1>Booking Confirmed!</h1>

        <p>
          Thank you for choosing
          <strong> Ramon's Service Marketplace.</strong>
        </p>

        <hr />

        <h2>Booking Details</h2>

        <p>
          <strong>Booking Reference:</strong> {bookingId}
        </p>

        {booking && (
          <>
            <p>
              <strong>House Size:</strong> {booking.houseSize}
            </p>

            <p>
              <strong>Cleaning Type:</strong> {booking.cleaningType}
            </p>

            <p>
              <strong>Frequency:</strong> {booking.frequency}
            </p>

            <p>
              <strong>Date:</strong> {booking.date}
            </p>

            <p>
              <strong>Time:</strong> {booking.time}
            </p>

            <p>
              <strong>Address:</strong> {booking.address}
            </p>
          </>
        )}

        <p>
          <strong>Payment Method:</strong> {paymentMethod}
        </p>

        <h2>Total Paid</h2>

        <h1 className="total-price">
          Ksh {total}
        </h1>

        <hr />

        <h3>What Happens Next?</h3>

        <ul>
          <li>Your booking has been received.</li>
          <li>A service provider will be assigned.</li>
          <li>You will receive booking updates.</li>
          <li>The provider will arrive at your selected date and time.</li>
        </ul>

        <div className="success-buttons">

          <button
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

          <button
            onClick={() => navigate("/services")}
          >
            Book Another Service
          </button>

        </div>

      </div>

    </div>
  );
}

export default Success;