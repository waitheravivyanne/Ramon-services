
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Booking.css";

function Booking() {
  const navigate = useNavigate();

  // ==========================
  // HOUSE SIZE PRICING
  // ==========================

 const pricing = {
  "Bedsitter": {
    "Standard Cleaning": 1500,
    "Deep Cleaning": 2200,
    "Move In / Move Out": 2800,
    "Post Construction": 3500,
    "Fumigation": 3000,
  },

  "1 Bedroom": {
    "Standard Cleaning": 2000,
    "Deep Cleaning": 3000,
    "Move In / Move Out": 3800,
    "Post Construction": 4500,
    "Fumigation": 3500,
  },

  "2 Bedroom": {
    "Standard Cleaning": 3000,
    "Deep Cleaning": 4200,
    "Move In / Move Out": 5200,
    "Post Construction": 6500,
    "Fumigation": 4500,
  },

  "3 Bedroom": {
    "Standard Cleaning": 4000,
    "Deep Cleaning": 5500,
    "Move In / Move Out": 6800,
    "Post Construction": 8200,
    "Fumigation": 5500,
  },

  "4 Bedroom": {
    "Standard Cleaning": 5500,
    "Deep Cleaning": 7200,
    "Move In / Move Out": 8800,
    "Post Construction": 10500,
    "Fumigation": 7000,
  },

  "5 Bedroom": {
    "Standard Cleaning": 7000,
    "Deep Cleaning": 9000,
    "Move In / Move Out": 11000,
    "Post Construction": 13000,
    "Fumigation": 8500,
  },

  "5+ Bedroom": {
    "Standard Cleaning": 8500,
    "Deep Cleaning": 11000,
    "Move In / Move Out": 13500,
    "Post Construction": 16000,
    "Fumigation": 10000,
  },
};

  // ==========================
  // CLEANING TYPE MULTIPLIERS
  // ==========================

  const cleaningMultiplier = {
    "Standard Cleaning": 1,
    "Deep Cleaning": 1.5,
    "Move In / Move Out": 1.8,
    "Post Construction": 2,
    "Fumigation": 2.5,
  };


  // OPTIONAL EXTRAS
  // ==========================

  const extrasList = [
    { name: "Inside Fridge", price: 500 },
    { name: "Inside Oven", price: 400 },
    { name: "Balcony Cleaning", price: 300 },
    { name: "Laundry", price: 700 },
    { name: "Ironing", price: 500 },
    { name: "Pest Control / Fumigation", price: 2500 },
  ];

  // ==========================
  // FORM STATE
  // ==========================

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

  // ==========================
  // HANDLE INPUT CHANGES
  // ==========================

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // HANDLE EXTRAS
  // ==========================

  const handleExtra = (extra) => {
    const exists = booking.extras.find(
      (item) => item.name === extra.name
    );

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

  

  // 1. House size price
const housePrice =
  pricing[booking.houseSize]?.[booking.cleaningType] || 0;
// 2. Cleaning type multiplier
const multiplier =
  cleaningMultiplier[booking.cleaningType] || 1;

// 3. Price after cleaning type
const cleaningPrice = Math.round(
  housePrice * multiplier
);

// 4. Frequency discount
const frequencyDiscount = {
  "One-Time": 0,
  "Weekly": 0.10,
  "Bi-Weekly": 0.05,
  "Monthly Subscription": 0.15,
};

const discountRate =
  frequencyDiscount[booking.frequency] || 0;

// Amount deducted because of frequency
const discountAmount = Math.round(
  cleaningPrice * discountRate
);

// Price after discount
const discountedPrice =
  cleaningPrice - discountAmount;

// 5. Extras total
const extrasTotal = booking.extras.reduce(
  (sum, item) => sum + item.price,
  0
);

// 6. Grand Total
const total = discountedPrice + extrasTotal;
  // ==========================
  // GO TO CHECKOUT
  // ==========================

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
              checked={booking.extras.some(
                (item) => item.name === extra.name
              )}
              onChange={() => handleExtra(extra)}
            />

            {extra.name} (+Ksh {extra.price})
          </label>
        </div>
      ))}

      <hr />

     
      <h2>Price Summary</h2>

<p>
  House Size Price:
  <strong> Ksh {housePrice}</strong>
</p>

<p>
  Cleaning Type:
  <strong> {booking.cleaningType || "Not Selected"}</strong>
</p>

<p>
  Cleaning Charge:
  <strong> Ksh {cleaningPrice}</strong>
</p>

<p>
  Frequency:
  <strong> {booking.frequency || "Not Selected"}</strong>
</p>

{discountAmount > 0 && (
  <p style={{ color: "green" }}>
    Frequency Discount:
    <strong> -Ksh {discountAmount}</strong>
  </p>
)}

<h3>Extras</h3>

{booking.extras.length === 0 ? (
  <p>No extras selected</p>
) : (
  booking.extras.map((extra) => (
    <p key={extra.name}>
      {extra.name}: Ksh {extra.price}
    </p>
  ))
)}

<p>
  Extras Total:
  <strong> Ksh {extrasTotal}</strong>
</p>

<hr />

<h2 style={{ color: "#16a34a" }}>
  Total: Ksh {total}
</h2>

      {booking.frequency &&
        booking.frequency !== "One-Time" && (
          <p style={{ color: "green", fontWeight: "bold" }}>
            Discount Applied ✔
          </p>
        )}

      <h2
        style={{
          color: "#16a34a",
          marginTop: "20px",
        }}
      >
        Total: Ksh {total}
      </h2>

      <button
        className="checkout-btn"
        onClick={proceedToCheckout}
      >
        Proceed to Checkout
      </button>

    </div>
  );
}

export default Booking;