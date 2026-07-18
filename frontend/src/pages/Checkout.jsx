import { useLocation, useNavigate } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const total = location.state?.total;

  if (!booking) {
    return (
      <div>
        <h2>No booking found.</h2>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <h3>Booking Summary</h3>

      <p><strong>House Size:</strong> {booking.houseSize}</p>
      <p><strong>Cleaning Type:</strong> {booking.cleaningType}</p>
      <p><strong>Frequency:</strong> {booking.frequency}</p>
      <p><strong>Date:</strong> {booking.date}</p>
      <p><strong>Time:</strong> {booking.time}</p>

      <h3>Extras</h3>

      {booking.extras.length > 0 ? (
        booking.extras.map((extra) => (
          <p key={extra.name}>
            {extra.name} - Ksh {extra.price}
          </p>
        ))
      ) : (
        <p>No extras selected.</p>
      )}

      <h2>Total: Ksh {total}</h2>

      <button onClick={() => navigate("/payment")}>
        Continue to Payment
      </button>
    </div>
  );
}

export default Checkout;