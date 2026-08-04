import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import "../styles/Success.css";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;
  const total = location.state?.total;
  const paymentMethod = location.state?.paymentMethod;

  // Generate booking reference only once
  const bookingId = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const randomNumber = Math.floor(
      1000 + Math.random() * 9000
    );

    return `RM-${year}${month}${day}-${randomNumber}`;
  }, []);

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

        {booking ? (
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

            {booking.city && (
              <p>
                <strong>City:</strong> {booking.city}
              </p>
            )}

            {booking.estate && (
              <p>
                <strong>Estate:</strong> {booking.estate}
              </p>
            )}

            {booking.houseNumber && (
              <p>
                <strong>House Number:</strong> {booking.houseNumber}
              </p>
            )}

            {booking.notes && (
              <p>
                <strong>Special Instructions:</strong> {booking.notes}
              </p>
            )}

          </>
        ) : (
          <p>No booking information available.</p>
        )}

        <p>
          <strong>Payment Method:</strong>{" "}
          {paymentMethod || "Not Provided"}
        </p>

        <h2>Total Paid</h2>

        <h1 className="total-price">
          Ksh {total || 0}
        </h1>

        <hr />

        <h3>What Happens Next?</h3>

        <ul>

          <li>Your booking has been received.</li>

          <li>Your payment has been verified.</li>

          <li>A qualified service provider will be assigned.</li>

          <li>
            You will receive booking updates by email or SMS.
          </li>

          <li>
            The provider will arrive on your selected date and time.
          </li>

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