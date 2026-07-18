import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./Booking.css";

function Booking() {
  const navigate = useNavigate();

  const basePrice = 1500;

  const extrasList = [
    { name: "Inside Fridge", price: 500 },
    { name: "Inside Oven", price: 400 },
    { name: "Balcony Cleaning", price: 300 },
    { name: "Laundry", price: 700 },
    { name: "Ironing", price: 500 },
    { name: "Pest Control / Fumigation", price: 2500 },
  ];

  const [booking, setBooking] = useState({
    houseSize: "",
    cleaningType: "",
    frequency: "",
    date: "",
    time: "",
    address: "",
    city: "",
    estate: "",
    houseNumber: "",
    notes: "",
    extras: [],
  });

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value,
    });
  };

  const handleExtra = (extra) => {
    const exists = booking.extras.find((item) => item.name === extra.name);

    if (exists) {
      setBooking({
        ...booking,
        extras: booking.extras.filter(
          (item) => item.name !== extra.name
        ),
      });
    } else {
      setBooking({
        ...booking,
        extras: [...booking.extras, extra],
      });
    }
  };

  const extrasTotal = booking.extras.reduce(
    (sum, item) => sum + item.price,
    0
  );

  const total = basePrice + extrasTotal;

  const proceedToCheckout = () => {
    navigate("/checkout", {
      state: {
        booking,
        total,
      },
    });
  };

  return (
    <div className="booking-container">

      <h1>Book House Cleaning</h1>

      <h3>House Size</h3>

      <select
        name="houseSize"
        value={booking.houseSize}
        onChange={handleChange}
      >
        <option value="">Select House Size</option>
        <option>Bedsitter</option>
        <option>1 Bedroom</option>
        <option>2 Bedroom</option>
        <option>3 Bedroom</option>
        <option>4 Bedroom</option>
        <option>5+ Bedroom</option>
      </select>

      <h3>Cleaning Type</h3>

      <select
        name="cleaningType"
        value={booking.cleaningType}
        onChange={handleChange}
      >
        <option value="">Select Cleaning Type</option>
        <option>Standard Cleaning</option>
        <option>Deep Cleaning</option>
        <option>Move In / Move Out</option>
        <option>Post Construction</option>
        <option>Fumigation</option>
      </select>

      <h3>Frequency</h3>

      <select
        name="frequency"
        value={booking.frequency}
        onChange={handleChange}
      >
        <option value="">Select Frequency</option>
        <option>One-Time</option>
        <option>Weekly</option>
        <option>Bi-Weekly</option>
        <option>Monthly Subscription</option>
      </select>

      <h3>Cleaning Date</h3>

      <input
        type="date"
        name="date"
        value={booking.date}
        onChange={handleChange}
      />

      <h3>Preferred Time</h3>

      <select
        name="time"
        value={booking.time}
        onChange={handleChange}
      >
        <option value="">Select Time</option>
        <option>8:00 AM - 10:00 AM</option>
        <option>10:00 AM - 12:00 PM</option>
        <option>12:00 PM - 2:00 PM</option>
        <option>2:00 PM - 4:00 PM</option>
        <option>4:00 PM - 6:00 PM</option>
      </select>

      <h3>Address</h3>

      <input
        type="text"
        name="address"
        placeholder="Street Address"
        value={booking.address}
        onChange={handleChange}
      />

      <input
        type="text"
        name="city"
        placeholder="City"
        value={booking.city}
        onChange={handleChange}
      />

      <input
        type="text"
        name="estate"
        placeholder="Estate / Area"
        value={booking.estate}
        onChange={handleChange}
      />

      <input
        type="text"
        name="houseNumber"
        placeholder="House Number"
        value={booking.houseNumber}
        onChange={handleChange}
      />

      <h3>Special Instructions</h3>

      <textarea
        name="notes"
        placeholder="Any special instructions?"
        value={booking.notes}
        onChange={handleChange}
      />

      <h3>Add Extras</h3>

      {extrasList.map((extra) => (
        <div key={extra.name}>
          <label>
            <input
              type="checkbox"
              onChange={() => handleExtra(extra)}
            />
            {extra.name} (+Ksh {extra.price})
          </label>
        </div>
      ))}

      <hr />

      <h2>Price Summary</h2>

      <p>Base Cleaning: Ksh {basePrice}</p>

      {booking.extras.map((extra) => (
        <p key={extra.name}>
          {extra.name}: Ksh {extra.price}
        </p>
      ))}

      <h2>Total: Ksh {total}</h2>

      <button onClick={proceedToCheckout}>
        Proceed to Checkout
      </button>

    </div>
  );
}

export default Booking;