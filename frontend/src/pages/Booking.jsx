import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import services from "../data/services";
import "../styles/Booking.css";


// ======================================================
// HOUSE PRICES
// ======================================================

const HOUSE_PRICES = {
  Bedsitter: {
    "Standard Cleaning": 1500,
    "Deep Cleaning": 2200,
    "Move In / Move Out": 2800,
    "Post Construction": 3500,
    Fumigation: 3000,
  },

  "1 Bedroom": {
    "Standard Cleaning": 2000,
    "Deep Cleaning": 3000,
    "Move In / Move Out": 3800,
    "Post Construction": 4500,
    Fumigation: 3500,
  },

  "2 Bedroom": {
    "Standard Cleaning": 2500,
    "Deep Cleaning": 3750,
    "Move In / Move Out": 4500,
    "Post Construction": 5500,
    Fumigation: 4500,
  },

  "3 Bedroom": {
    "Standard Cleaning": 3000,
    "Deep Cleaning": 4500,
    "Move In / Move Out": 5400,
    "Post Construction": 6500,
    Fumigation: 5500,
  },

  "4 Bedroom": {
    "Standard Cleaning": 4000,
    "Deep Cleaning": 6000,
    "Move In / Move Out": 7200,
    "Post Construction": 8000,
    Fumigation: 6500,
  },

  "5+ Bedroom": {
    "Standard Cleaning": 5000,
    "Deep Cleaning": 7500,
    "Move In / Move Out": 9000,
    "Post Construction": 10000,
    Fumigation: 8000,
  },
};


// ======================================================
// FREQUENCY DISCOUNTS
// ======================================================

const FREQUENCY_DISCOUNTS = {
  "One-Time": 0,
  Weekly: 0.10,
  "Bi-Weekly": 0.05,
  "Monthly Subscription": 0.15,
};


// ======================================================
// CLEANING MULTIPLIERS
// ======================================================

const CLEANING_MULTIPLIERS = {
  "Standard Cleaning": 1,
  "Deep Cleaning": 1.5,
  "Move In / Move Out": 1.8,
  "Post Construction": 2,
  Fumigation: 2.5,
};


// ======================================================
// EXTRAS
// ======================================================

const EXTRAS = [
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


// ======================================================
// TIME SLOTS
// ======================================================

const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];


// ======================================================
// BOOKING COMPONENT
// ======================================================

function Booking() {

  const navigate = useNavigate();

  const { serviceId, categoryId } = useParams();


  // ====================================================
  // FIND SERVICE AND CATEGORY
  // ====================================================

  const service = services.find(
    (item) => String(item.id) === String(serviceId)
  );

  const category = service?.categories?.find(
    (item) => String(item.id) === String(categoryId)
  );


  // ====================================================
  // FORM STATE
  // ====================================================

  const [form, setForm] = useState({
    houseSize: "Bedsitter",
    cleaningType: "Standard Cleaning",
    frequency: "One-Time",

    date: "",
    time: "",

    address: "",
    city: "",
    estate: "",
    houseNumber: "",

    notes: "",

    extras: [],
  });


  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ====================================================
  // EXTRA CHECKBOX
  // ====================================================

  const handleExtraChange = (extra) => {

    setForm((previous) => {

      const alreadySelected =
        previous.extras.some(
          (item) => item.name === extra.name
        );


      if (alreadySelected) {

        return {
          ...previous,

          extras:
            previous.extras.filter(
              (item) =>
                item.name !== extra.name
            ),
        };
      }


      return {
        ...previous,

        extras: [
          ...previous.extras,
          extra,
        ],
      };
    });
  };


  // ====================================================
  // AVAILABLE EXTRAS
  // ====================================================

  const availableExtras = EXTRAS;


  // ====================================================
  // PRICE CALCULATION
  // ====================================================

  const priceSummary = useMemo(() => {

    const housePrices =
      HOUSE_PRICES[form.houseSize] || {};


    const basePrice =
      housePrices[form.cleaningType] || 0;


    const multiplier =
      CLEANING_MULTIPLIERS[
        form.cleaningType
      ] || 1;


    /*
      We use the house-size price directly because
      HOUSE_PRICES already contains the prices for
      each cleaning type.

      The multiplier is retained for compatibility
      with your original pricing structure.
    */

    const cleaningPrice =
      basePrice > 0
        ? basePrice
        : basePrice * multiplier;


    const discountRate =
      FREQUENCY_DISCOUNTS[
        form.frequency
      ] || 0;


    const discountAmount =
      cleaningPrice * discountRate;


    const discountedPrice =
      cleaningPrice - discountAmount;


    const extrasTotal =
      form.extras.reduce(
        (total, extra) =>
          total + Number(extra.price || 0),
        0
      );


    const total =
      discountedPrice + extrasTotal;


    return {
      basePrice,
      multiplier,
      cleaningPrice,
      discountRate,
      discountAmount,
      discountedPrice,
      extrasTotal,
      total,
    };

  }, [
    form.houseSize,
    form.cleaningType,
    form.frequency,
    form.extras,
  ]);


  // ====================================================
  // SUBMIT BOOKING
  // ====================================================

  const handleSubmit = (e) => {

    e.preventDefault();


    if (
      !form.date ||
      !form.time ||
      !form.address ||
      !form.city
    ) {

      alert(
        "Please complete all required fields marked with *."
      );

      return;
    }


    const booking = {

      serviceId,

      categoryId,

      serviceName:
        service?.name || "",

      categoryName:
        category?.name || "",

      houseSize:
        form.houseSize,

      cleaningType:
        form.cleaningType,

      frequency:
        form.frequency,

      date:
        form.date,

      time:
        form.time,

      address:
        form.address,

      city:
        form.city,

      estate:
        form.estate,

      houseNumber:
        form.houseNumber,

      notes:
        form.notes,

      extras:
        form.extras,

      cleaningPrice:
        priceSummary.cleaningPrice,

      discount:
        priceSummary.discountAmount,

      extrasTotal:
        priceSummary.extrasTotal,

      total:
        priceSummary.total,
    };


    navigate("/checkout", {

      state: {

        booking,

        total:
          priceSummary.total,

      },

    });

  };


  // ====================================================
  // INVALID SERVICE/CATEGORY
  // ====================================================

  if (!service || !category) {

    return (

      <div className="booking-error">

        <h2>
          Booking information not found
        </h2>

        <p>
          The service you are trying to book
          could not be found.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/services")
          }
        >
          ← Back to Services
        </button>

      </div>

    );
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="booking-page">

      <div className="booking-card">


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="booking-header">

          


          <div>

            <span className="booking-badge">
              {service.icon} {service.name}
            </span>

            <h1>
              Book {category.name}
            </h1>

            <p>
              Schedule your service and
              customize your booking.
            </p>

          </div>

        </div>


        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >


          {/* ========================================
              SERVICE INFORMATION
          ======================================== */}

          <section className="booking-section">

            <div className="section-heading">

              <span className="section-number">
                1
              </span>

              <div>

                <h2>
                  Service Details
                </h2>

                <p>
                  Choose the details for your service.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* HOUSE SIZE */}

              <div className="form-group">

                <label htmlFor="houseSize">
                  House Size <span>*</span>
                </label>

                <select
                  id="houseSize"
                  name="houseSize"
                  value={form.houseSize}
                  onChange={handleChange}
                  required
                >

                  {Object.keys(HOUSE_PRICES).map(
                    (size) => (

                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* CLEANING TYPE */}

              <div className="form-group">

                <label htmlFor="cleaningType">
                  Cleaning Type <span>*</span>
                </label>

                <select
                  id="cleaningType"
                  name="cleaningType"
                  value={form.cleaningType}
                  onChange={handleChange}
                  required
                >

                  {Object.keys(
                    CLEANING_MULTIPLIERS
                  ).map(
                    (type) => (

                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* FREQUENCY */}

              <div className="form-group">

                <label htmlFor="frequency">
                  Frequency <span>*</span>
                </label>

                <select
                  id="frequency"
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  required
                >

                  {Object.entries(
                    FREQUENCY_DISCOUNTS
                  ).map(
                    ([frequency, discount]) => (

                      <option
                        key={frequency}
                        value={frequency}
                      >

                        {frequency}

                        {discount > 0
                          ? ` - ${discount * 100}% discount`
                          : ""}

                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </section>


          {/* ========================================
              DATE AND TIME
          ======================================== */}

          <section className="booking-section">

            <div className="section-heading">

              <span className="section-number">
                2
              </span>

              <div>

                <h2>
                  Date & Time
                </h2>

                <p>
                  When would you like the service?
                </p>

              </div>

            </div>


            <div className="form-grid">


              <div className="form-group">

                <label htmlFor="date">
                  Service Date <span>*</span>
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="time">
                  Preferred Time <span>*</span>
                </label>

                <select
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a time
                  </option>

                  {TIME_SLOTS.map(
                    (slot) => (

                      <option
                        key={slot}
                        value={slot}
                      >
                        {slot}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </section>


          {/* ========================================
              LOCATION
          ======================================== */}

          <section className="booking-section">

            <div className="section-heading">

              <span className="section-number">
                3
              </span>

              <div>

                <h2>
                  Service Location
                </h2>

                <p>
                  Tell us where the service will
                  take place.
                </p>

              </div>

            </div>


            <div className="form-grid">


              <div className="form-group full-width">

                <label htmlFor="address">
                  Address <span>*</span>
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Enter your street / building"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="city">
                  City <span>*</span>
                </label>

                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="e.g. Nairobi"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="estate">
                  Estate
                </label>

                <input
                  id="estate"
                  type="text"
                  name="estate"
                  placeholder="e.g. Kilimani"
                  value={form.estate}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label htmlFor="houseNumber">
                  House / Apartment Number
                </label>

                <input
                  id="houseNumber"
                  type="text"
                  name="houseNumber"
                  placeholder="e.g. A12"
                  value={form.houseNumber}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>


          {/* ========================================
              EXTRAS
          ======================================== */}

          <section className="booking-section">

            <div className="section-heading">

              <span className="section-number">
                4
              </span>

              <div>

                <h2>
                  Extra Services
                </h2>

                <p>
                  Customize your booking with
                  additional services.
                </p>

              </div>

            </div>


            <div className="extras-grid">

              {availableExtras.map(
                (extra) => {

                  const selected =
                    form.extras.some(
                      (item) =>
                        item.name === extra.name
                    );


                  return (

                    <label
                      key={extra.name}
                      className={
                        `extra-option ${
                          selected
                            ? "selected"
                            : ""
                        }`
                      }
                    >

                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          handleExtraChange(
                            extra
                          )
                        }
                      />


                      <div className="extra-content">

                        <strong>
                          {extra.name}
                        </strong>

                        <span>
                          + Ksh{" "}
                          {extra.price.toLocaleString()}
                        </span>

                      </div>

                    </label>

                  );

                }
              )}

            </div>

          </section>


          {/* ========================================
              NOTES
          ======================================== */}

          <section className="booking-section">

            <div className="section-heading">

              <span className="section-number">
                5
              </span>

              <div>

                <h2>
                  Special Instructions
                </h2>

                <p>
                  Anything else we should know?
                </p>

              </div>

            </div>


            <div className="form-group">

              <textarea
                name="notes"
                rows="5"
                placeholder="Enter any special instructions..."
                value={form.notes}
                onChange={handleChange}
              />

            </div>

          </section>


          {/* ========================================
              PRICE SUMMARY
          ======================================== */}

          <section className="price-summary">

            <div className="price-summary-header">

              <h2>
                Price Summary
              </h2>

              <span>
                💰
              </span>

            </div>


            <div className="price-row">

              <span>
                Cleaning Service
              </span>

              <strong>
                Ksh{" "}
                {priceSummary.cleaningPrice.toLocaleString()}
              </strong>

            </div>


            {priceSummary.discountAmount > 0 && (

              <div className="price-row discount">

                <span>
                  Frequency Discount
                </span>

                <strong>
                  - Ksh{" "}
                  {priceSummary.discountAmount.toLocaleString()}
                </strong>

              </div>

            )}


            <div className="price-row">

              <span>
                Extra Services
              </span>

              <strong>
                Ksh{" "}
                {priceSummary.extrasTotal.toLocaleString()}
              </strong>

            </div>


            <div className="price-divider" />


            <div className="price-total">

              <span>
                Total
              </span>

              <strong>
                Ksh{" "}
                {priceSummary.total.toLocaleString()}
              </strong>

            </div>

          </section>


          {/* ========================================
              SUBMIT
          ======================================== */}

          <button
            type="submit"
            className="booking-submit"
          >
            Proceed to Checkout →
          </button>


          <p className="required-note">
            <span>*</span> Required fields
          </p>


        </form>

      </div>

    </div>

  );
}


export default Booking;