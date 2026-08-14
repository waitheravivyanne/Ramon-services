import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Booking.css";

function Booking() {
  const navigate = useNavigate();
  const { serviceId, categoryId } = useParams();

  // =========================================================
  // SERVICE INFORMATION
  // =========================================================

  const serviceNames = {
    1: "Cleaning",
    2: "Laundry",
    3: "Plumbing",
    4: "Electrical",
    5: "Gardening",
    6: "Painting",
    7: "Moving",
  };

  const serviceName =
    serviceNames[Number(serviceId)] || "Service";

  // =========================================================
  // CLEANING PRICES
  // =========================================================

  const cleaningPricing = {
    Bedsitter: {
      "General Cleaning": 1500,
      "Deep Cleaning": 2200,
      "Move In / Move Out": 2800,
      "Post Construction": 3500,
      Fumigation: 3000,
    },

    "1 Bedroom": {
      "General Cleaning": 2000,
      "Deep Cleaning": 3000,
      "Move In / Move Out": 3800,
      "Post Construction": 4500,
      Fumigation: 3500,
    },

    "2 Bedroom": {
      "General Cleaning": 3000,
      "Deep Cleaning": 4200,
      "Move In / Move Out": 5200,
      "Post Construction": 6500,
      Fumigation: 4500,
    },

    "3 Bedroom": {
      "General Cleaning": 4000,
      "Deep Cleaning": 5500,
      "Move In / Move Out": 6800,
      "Post Construction": 8200,
      Fumigation: 5500,
    },

    "4 Bedroom": {
      "General Cleaning": 5500,
      "Deep Cleaning": 7200,
      "Move In / Move Out": 8800,
      "Post Construction": 10500,
      Fumigation: 7000,
    },

    "5 Bedroom": {
      "General Cleaning": 7000,
      "Deep Cleaning": 9000,
      "Move In / Move Out": 11000,
      "Post Construction": 13000,
      Fumigation: 8500,
    },

    "5+ Bedroom": {
      "General Cleaning": 8500,
      "Deep Cleaning": 11000,
      "Move In / Move Out": 13500,
      "Post Construction": 16000,
      Fumigation: 10000,
    },
  };

  // =========================================================
  // OTHER SERVICE PRICES
  // =========================================================

  const otherServicePricing = {
    Laundry: {
      "Basic Laundry": 800,
      "Wash & Fold": 1200,
      "Wash & Iron": 1600,
      "Full Laundry Service": 2000,
    },

    Plumbing: {
      "General Plumbing": 1500,
      "Pipe Repair": 2500,
      "Leak Repair": 2000,
      "Drain Cleaning": 1800,
      "Emergency Plumbing": 3500,
    },

    Electrical: {
      "General Electrical": 1500,
      "Socket Installation": 1200,
      "Lighting Installation": 1500,
      "Electrical Repair": 2500,
      "Emergency Electrical": 3500,
    },

    Gardening: {
      "General Gardening": 1500,
      "Lawn Maintenance": 2000,
      "Tree Trimming": 2500,
      "Garden Cleanup": 1800,
    },

    Painting: {
      "Single Room": 3500,
      "Two Rooms": 6000,
      "Three Rooms": 8500,
      "Full House": 15000,
    },

    Moving: {
      "Small Move": 5000,
      "Medium Move": 8000,
      "Large Move": 12000,
      "Full House Move": 18000,
    },
  };

  // =========================================================
  // CLEANING EXTRAS
  // =========================================================

  const cleaningExtras = [
    {
      name: "Inside Fridge",
      price: 500,
    },
    {
      name: "Inside Oven",
      price: 400,
    },
    {
      name: "Balcony Cleaning",
      price: 300,
    },
    {
      name: "Laundry",
      price: 700,
    },
    {
      name: "Ironing",
      price: 500,
    },
    {
      name: "Pest Control / Fumigation",
      price: 2500,
    },
  ];

  // =========================================================
  // FREQUENCY DISCOUNTS
  // =========================================================

  const frequencyDiscount = {
    "One-Time": 0,
    Weekly: 0.10,
    "Bi-Weekly": 0.05,
    "Monthly Subscription": 0.15,
  };

  // =========================================================
  // FORM STATE
  // =========================================================

  const [booking, setBooking] = useState({
    serviceId: serviceId || "",
    categoryId: categoryId || "",
    service: serviceName,

    houseSize: "",
    cleaningType: "",
    serviceType: "",

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

  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBooking((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // HANDLE EXTRAS
  // =========================================================

  const handleExtra = (extra) => {
    setBooking((previous) => {
      const exists = previous.extras.some(
        (item) => item.name === extra.name
      );

      if (exists) {
        return {
          ...previous,
          extras: previous.extras.filter(
            (item) => item.name !== extra.name
          ),
        };
      }

      return {
        ...previous,
        extras: [...previous.extras, extra],
      };
    });
  };

  // =========================================================
  // CLEANING PRICE
  // =========================================================

  const cleaningBasePrice =
    cleaningPricing[booking.houseSize]?.[
      booking.cleaningType
    ] || 0;

  // =========================================================
  // OTHER SERVICE PRICE
  // =========================================================

  const otherServiceBasePrice =
    otherServicePricing[serviceName]?.[
      booking.serviceType
    ] || 0;

  // =========================================================
  // BASE PRICE
  // =========================================================

  const basePrice =
    serviceName === "Cleaning"
      ? cleaningBasePrice
      : otherServiceBasePrice;

  // =========================================================
  // FREQUENCY DISCOUNT
  // =========================================================

  const discountRate =
    frequencyDiscount[booking.frequency] || 0;

  const discountAmount = Math.round(
    basePrice * discountRate
  );

  const discountedPrice =
    basePrice - discountAmount;

  // =========================================================
  // EXTRAS
  // =========================================================

  const extrasTotal = booking.extras.reduce(
    (sum, item) => sum + item.price,
    0
  );

  // =========================================================
  // FINAL TOTAL
  // =========================================================

  const total = discountedPrice + extrasTotal;

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateBooking = () => {
    if (!booking.date) {
      setError("Please select a cleaning/service date.");
      return false;
    }

    if (!booking.time) {
      setError("Please select your preferred time.");
      return false;
    }

    if (!booking.address.trim()) {
      setError("Please enter your street address.");
      return false;
    }

    if (!booking.city.trim()) {
      setError("Please enter your city.");
      return false;
    }

    if (!booking.estate.trim()) {
      setError("Please enter your estate or area.");
      return false;
    }

    if (!booking.houseNumber.trim()) {
      setError("Please enter your house number.");
      return false;
    }

    if (serviceName === "Cleaning") {
      if (!booking.houseSize) {
        setError("Please select your house size.");
        return false;
      }

      if (!booking.cleaningType) {
        setError("Please select the cleaning type.");
        return false;
      }

      if (!booking.frequency) {
        setError("Please select the cleaning frequency.");
        return false;
      }
    } else {
      if (!booking.serviceType) {
        setError(
          `Please select the type of ${serviceName.toLowerCase()} service.`
        );
        return false;
      }
    }

    return true;
  };

  // =========================================================
  // PROCEED TO CHECKOUT
  // =========================================================

  const proceedToCheckout = () => {
    if (!validateBooking()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    navigate("/checkout", {
      state: {
        booking,
        total,
        basePrice,
        discountAmount,
        extrasTotal,
        serviceName,
      },
    });
  };

  // =========================================================
  // BACK BUTTON
  // =========================================================

  const goBack = () => {
    navigate(-1);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="booking-container">

     

      {/* HEADER */}

      <div className="booking-header">

        <span className="booking-icon">
          🛠️
        </span>

        <h1>
          Book {serviceName}
        </h1>

        <p>
          Complete the form below to schedule your service.
        </p>

      </div>

      {/* ERROR */}

      {error && (
        <div className="booking-error">
          ⚠️ {error}
        </div>
      )}

      {/* =====================================================
          CLEANING SECTION
      ===================================================== */}

      {serviceName === "Cleaning" && (
        <>
          <div className="form-section">

            <h2>🏠 Cleaning Details</h2>

            {/* HOUSE SIZE */}

            <label>
              House Size <span className="required">*</span>
            </label>

            <select
              name="houseSize"
              value={booking.houseSize}
              onChange={handleChange}
            >
              <option value="">
                Select House Size
              </option>

              {Object.keys(cleaningPricing).map(
                (size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                )
              )}
            </select>

            {/* CLEANING TYPE */}

            <label>
              Cleaning Type{" "}
              <span className="required">*</span>
            </label>

            <select
              name="cleaningType"
              value={booking.cleaningType}
              onChange={handleChange}
            >
              <option value="">
                Select Cleaning Type
              </option>

              <option>
                General Cleaning
              </option>

              <option>
                Deep Cleaning
              </option>

              <option>
                Move In / Move Out
              </option>

              <option>
                Post Construction
              </option>

              <option>
                Fumigation
              </option>
            </select>

            {/* FREQUENCY */}

            <label>
              Frequency{" "}
              <span className="required">*</span>
            </label>

            <select
              name="frequency"
              value={booking.frequency}
              onChange={handleChange}
            >
              <option value="">
                Select Frequency
              </option>

              <option value="One-Time">
                One-Time
              </option>

              <option value="Weekly">
                Weekly — 10% Discount
              </option>

              <option value="Bi-Weekly">
                Bi-Weekly — 5% Discount
              </option>

              <option value="Monthly Subscription">
                Monthly Subscription — 15% Discount
              </option>
            </select>

          </div>

          {/* CLEANING EXTRAS */}

          <div className="form-section">

            <h2>✨ Optional Extras</h2>

            {cleaningExtras.map((extra) => (
              <label
                className="extra-option"
                key={extra.name}
              >

                <input
                  type="checkbox"
                  checked={booking.extras.some(
                    (item) =>
                      item.name === extra.name
                  )}
                  onChange={() =>
                    handleExtra(extra)
                  }
                />

                <span>
                  {extra.name}
                </span>

                <strong>
                  + Ksh {extra.price.toLocaleString()}
                </strong>

              </label>
            ))}

          </div>
        </>
      )}

      {/* =====================================================
          OTHER SERVICES
      ===================================================== */}

      {serviceName !== "Cleaning" && (
        <div className="form-section">

          <h2>
            🔧 {serviceName} Details
          </h2>

          <label>
            Service Type{" "}
            <span className="required">*</span>
          </label>

          <select
            name="serviceType"
            value={booking.serviceType}
            onChange={handleChange}
          >
            <option value="">
              Select Service Type
            </option>

            {Object.keys(
              otherServicePricing[serviceName] || {}
            ).map((type) => (
              <option
                key={type}
                value={type}
              >
                {type} — Ksh{" "}
                {otherServicePricing[
                  serviceName
                ][type].toLocaleString()}
              </option>
            ))}
          </select>

        </div>
      )}

      {/* =====================================================
          DATE & TIME
      ===================================================== */}

      <div className="form-section">

        <h2>📅 Schedule</h2>

        <label>
          Service Date{" "}
          <span className="required">*</span>
        </label>

        <input
          type="date"
          name="date"
          value={booking.date}
          onChange={handleChange}
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
        />

        <label>
          Preferred Time{" "}
          <span className="required">*</span>
        </label>

        <select
          name="time"
          value={booking.time}
          onChange={handleChange}
        >
          <option value="">
            Select Time
          </option>

          <option>
            8:00 AM - 10:00 AM
          </option>

          <option>
            10:00 AM - 12:00 PM
          </option>

          <option>
            12:00 PM - 2:00 PM
          </option>

          <option>
            2:00 PM - 4:00 PM
          </option>

          <option>
            4:00 PM - 6:00 PM
          </option>

        </select>

      </div>

      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <div className="form-section">

        <h2>📍 Service Location</h2>

        <label>
          Street Address{" "}
          <span className="required">*</span>
        </label>

        <input
          type="text"
          name="address"
          placeholder="e.g. Mombasa Road"
          value={booking.address}
          onChange={handleChange}
        />

        <label>
          City{" "}
          <span className="required">*</span>
        </label>

        <input
          type="text"
          name="city"
          placeholder="e.g. Nairobi"
          value={booking.city}
          onChange={handleChange}
        />

        <label>
          Estate / Area{" "}
          <span className="required">*</span>
        </label>

        <input
          type="text"
          name="estate"
          placeholder="e.g. South B"
          value={booking.estate}
          onChange={handleChange}
        />

        <label>
          House / Building Number{" "}
          <span className="required">*</span>
        </label>

        <input
          type="text"
          name="houseNumber"
          placeholder="e.g. House 24"
          value={booking.houseNumber}
          onChange={handleChange}
        />

      </div>

      {/* =====================================================
          SPECIAL INSTRUCTIONS
      ===================================================== */}

      <div className="form-section">

        <h2>📝 Special Instructions</h2>

        <label>
          Additional Notes
        </label>

        <textarea
          name="notes"
          placeholder="Tell the service provider anything important..."
          value={booking.notes}
          onChange={handleChange}
        />

      </div>

      {/* =====================================================
          PRICE SUMMARY
      ===================================================== */}

      <div className="price-summary">

        <h2>💰 Price Summary</h2>

        <div className="price-row">

          <span>
            Service
          </span>

          <strong>
            {serviceName}
          </strong>

        </div>

        {serviceName === "Cleaning" ? (
          <>
            <div className="price-row">

              <span>
                House Size
              </span>

              <strong>
                {booking.houseSize ||
                  "Not Selected"}
              </strong>

            </div>

            <div className="price-row">

              <span>
                Cleaning Type
              </span>

              <strong>
                {booking.cleaningType ||
                  "Not Selected"}
              </strong>

            </div>
          </>
        ) : (
          <div className="price-row">

            <span>
              Service Type
            </span>

            <strong>
              {booking.serviceType ||
                "Not Selected"}
            </strong>

          </div>
        )}

        <div className="price-row">

          <span>
            Base Price
          </span>

          <strong>
            Ksh {basePrice.toLocaleString()}
          </strong>

        </div>

        {serviceName === "Cleaning" &&
          booking.frequency && (
            <div className="price-row">

              <span>
                Frequency
              </span>

              <strong>
                {booking.frequency}
              </strong>

            </div>
          )}

        {discountAmount > 0 && (
          <div className="price-row discount">

            <span>
              Frequency Discount
            </span>

            <strong>
              - Ksh{" "}
              {discountAmount.toLocaleString()}
            </strong>

          </div>
        )}

        {booking.extras.length > 0 && (
          <>
            <h3>
              Extras
            </h3>

            {booking.extras.map(
              (extra) => (
                <div
                  className="price-row"
                  key={extra.name}
                >

                  <span>
                    {extra.name}
                  </span>

                  <strong>
                    + Ksh{" "}
                    {extra.price.toLocaleString()}
                  </strong>

                </div>
              )
            )}

            <div className="price-row">

              <span>
                Extras Total
              </span>

              <strong>
                Ksh{" "}
                {extrasTotal.toLocaleString()}
              </strong>

            </div>
          </>
        )}

        <hr />

        <div className="total-row">

          <span>
            Total
          </span>

          <strong>
            Ksh {total.toLocaleString()}
          </strong>

        </div>

      </div>

      {/* =====================================================
          BUTTON
      ===================================================== */}

      <button
        type="button"
        className="checkout-btn"
        onClick={proceedToCheckout}
      >
        Proceed to Checkout →
      </button>

      <p className="required-note">
        <span className="required">
          *
        </span>{" "}
        Required fields
      </p>

    </div>
  );
}

export default Booking;