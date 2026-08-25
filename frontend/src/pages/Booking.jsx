import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import services from "../data/services";
import "../styles/Booking.css";


// ======================================================
// GENERAL TIME SLOTS
// ======================================================

const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];


// ======================================================
// CLEANING PRICES
// ======================================================

const CLEANING_PRICES = {
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


const FREQUENCY_DISCOUNTS = {
  "One-Time": 0,
  Weekly: 0.10,
  "Bi-Weekly": 0.05,
  "Monthly Subscription": 0.15,
};


// ======================================================
// BOOKING COMPONENT
// ======================================================

function Booking() {

  const navigate = useNavigate();

  const { serviceId, categoryId } = useParams();


  // ====================================================
  // FIND SERVICE
  // ====================================================

  const service = services.find(
    (item) =>
      String(item.id) === String(serviceId)
  );


  // ====================================================
  // FIND CATEGORY
  // ====================================================

  const category = service?.categories?.find(
    (item) =>
      String(item.id) === String(categoryId)
  );


  // ====================================================
  // FORM
  // ====================================================

  const [form, setForm] = useState({

    // General
    date: "",
    time: "",

    address: "",
    city: "",
    estate: "",
    houseNumber: "",

    notes: "",


    // Cleaning
    houseSize: "Bedsitter",
    cleaningType: "Standard Cleaning",
    frequency: "One-Time",
    cleaningExtras: [],


    // Laundry
    laundryType: "",
    laundryQuantity: "",
    pickupDelivery: "Drop Off",


    // Plumbing
    plumbingIssue: "",
    plumbingUrgency: "Normal",


    // Electrical
    electricalIssue: "",
    electricalUrgency: "Normal",
    numberOfRooms: "",


    // Gardening
    gardenSize: "",
    gardeningService: "",
    gardeningFrequency: "One-Time",


    // Painting
    paintingType: "",
    numberOfRoomsPainting: "",
    wallCondition: "",
    paintProvided: "No",


    // Moving
    movingType: "",
    movingDistance: "",
    numberOfItems: "",
    packingRequired: "No",

  });


  // ====================================================
  // HANDLE CHANGE
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
  // CLEANING EXTRAS
  // ====================================================

  const cleaningExtrasList = [

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


  const handleCleaningExtra = (extra) => {

    setForm((previous) => {

      const exists =
        previous.cleaningExtras.some(
          (item) =>
            item.name === extra.name
        );


      if (exists) {

        return {

          ...previous,

          cleaningExtras:
            previous.cleaningExtras.filter(
              (item) =>
                item.name !== extra.name
            ),

        };

      }


      return {

        ...previous,

        cleaningExtras: [
          ...previous.cleaningExtras,
          extra,
        ],

      };

    });

  };


  // ====================================================
  // PRICE CALCULATION
  // ====================================================

  const priceSummary = useMemo(() => {

    let servicePrice = 0;

    let extrasTotal = 0;

    let discount = 0;


    // ================================================
    // CLEANING
    // ================================================

    if (service?.name === "Cleaning") {

      servicePrice =
        CLEANING_PRICES[
          form.houseSize
        ]?.[
          form.cleaningType
        ] || 0;


      const discountRate =
        FREQUENCY_DISCOUNTS[
          form.frequency
        ] || 0;


      discount =
        servicePrice *
        discountRate;


      extrasTotal =
        form.cleaningExtras.reduce(
          (total, extra) =>
            total + Number(extra.price),
          0
        );

    }


    // ================================================
    // LAUNDRY
    // ================================================

    else if (service?.name === "Laundry") {

      const quantity =
        Number(
          form.laundryQuantity
        ) || 0;


      if (
        form.laundryType ===
        "Wash & Fold"
      ) {

        servicePrice =
          quantity * 150;

      }

      else if (
        form.laundryType ===
        "Ironing"
      ) {

        servicePrice =
          quantity * 100;

      }

      else if (
        form.laundryType ===
        "Dry Cleaning"
      ) {

        servicePrice =
          quantity * 300;

      }

      if (
        form.pickupDelivery ===
        "Pickup & Delivery"
      ) {

        servicePrice += 300;

      }

    }


    // ================================================
    // PLUMBING
    // ================================================

    else if (service?.name === "Plumbing") {

      const plumbingPrices = {

        "Leak Repair": 1500,

        "Blocked Drain": 1800,

        "Toilet Repair": 2000,

        "Pipe Installation": 3000,

        "General Plumbing": 1500,

      };


      servicePrice =
        plumbingPrices[
          form.plumbingIssue
        ] || 0;


      if (
        form.plumbingUrgency ===
        "Urgent"
      ) {

        servicePrice += 500;

      }


      if (
        form.plumbingUrgency ===
        "Emergency"
      ) {

        servicePrice += 1000;

      }

    }


    // ================================================
    // ELECTRICAL
    // ================================================

    else if (
      service?.name ===
      "Electrical"
    ) {

      const electricalPrices = {

        "Electrical Repair": 1500,

        Wiring: 3000,

        "Light Installation": 1000,

        "Socket / Switch": 800,

        Installation: 2000,

      };


      servicePrice =
        electricalPrices[
          form.electricalIssue
        ] || 0;


      const rooms =
        Number(
          form.numberOfRooms
        ) || 1;


      if (
        form.electricalIssue ===
        "Wiring"
      ) {

        servicePrice *= rooms;

      }

    }


    // ================================================
    // GARDENING
    // ================================================

    else if (
      service?.name ===
      "Gardening"
    ) {

      const gardeningPrices = {

        "Lawn Mowing": 1500,

        "Garden Maintenance": 2000,

        "Tree Trimming": 2500,

        "Landscaping": 5000,

      };


      servicePrice =
        gardeningPrices[
          form.gardeningService
        ] || 0;


      if (
        form.gardenSize ===
        "Large"
      ) {

        servicePrice *= 1.5;

      }

    }


    // ================================================
    // PAINTING
    // ================================================

    else if (
      service?.name ===
      "Painting"
    ) {

      const rooms =
        Number(
          form.numberOfRoomsPainting
        ) || 0;


      if (
        form.paintingType ===
        "Interior Painting"
      ) {

        servicePrice =
          rooms * 5000;

      }

      else if (
        form.paintingType ===
        "Exterior Painting"
      ) {

        servicePrice =
          rooms * 6500;

      }

      else if (
        form.paintingType ===
        "Room Painting"
      ) {

        servicePrice =
          rooms * 4000;

      }


      if (
        form.wallCondition ===
        "Poor"
      ) {

        servicePrice +=
          rooms * 1500;

      }

    }


    // ================================================
    // MOVING
    // ================================================

    else if (
      service?.name ===
      "Moving"
    ) {

      const movingPrices = {

        "Single Item Moving": 1500,

        "House Moving": 5000,

        "Office Moving": 7000,

      };


      servicePrice =
        movingPrices[
          form.movingType
        ] || 0;


      const distance =
        Number(
          form.movingDistance
        ) || 0;


      if (distance > 10) {

        servicePrice +=
          (distance - 10) * 100;

      }


      if (
        form.packingRequired ===
        "Yes"
      ) {

        servicePrice += 2000;

      }

    }


    const total =
      servicePrice -
      discount +
      extrasTotal;


    return {

      servicePrice,

      discount,

      extrasTotal,

      total,

    };

  }, [
    service,
    form,
  ]);


  // ====================================================
  // SUBMIT
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
        "Please complete all required fields."
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

      ...form,

      pricing:
        priceSummary,

    };


    navigate(
      "/checkout",
      {
        state: {
          booking,

          total:
            priceSummary.total,
        },
      }
    );

  };


  // ====================================================
  // INVALID
  // ====================================================

  if (!service || !category) {

    return (

      <div className="booking-error">

        <h2>
          Booking information not found
        </h2>

        <p>
          The service you are trying to
          book could not be found.
        </p>

        <button
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


        {/* HEADER */}

        <div className="booking-header">

          <div>

            <span className="booking-badge">

              {service.icon}

              {" "}

              {service.name}

            </span>


            <h1>

              Book{" "}

              {category.name}

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


          {/* =================================================
              SERVICE SPECIFIC DETAILS
          ================================================= */}

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
                  Tell us what you need.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* ================= CLEANING ================= */}

              {service.name === "Cleaning" && (

                <>

                  <div className="form-group">

                    <label>
                      House Size *
                    </label>

                    <select
                      name="houseSize"
                      value={
                        form.houseSize
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      {Object.keys(
                        CLEANING_PRICES
                      ).map(
                        (size) => (

                          <option
                            key={size}
                          >
                            {size}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Cleaning Type *
                    </label>

                    <select
                      name="cleaningType"
                      value={
                        form.cleaningType
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      {Object.keys(
                        CLEANING_PRICES.Bedsitter
                      ).map(
                        (type) => (

                          <option
                            key={type}
                          >
                            {type}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Frequency *
                    </label>

                    <select
                      name="frequency"
                      value={
                        form.frequency
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      {Object.keys(
                        FREQUENCY_DISCOUNTS
                      ).map(
                        (frequency) => (

                          <option
                            key={frequency}
                          >
                            {frequency}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </>

              )}


              {/* ================= LAUNDRY ================= */}

              {service.name === "Laundry" && (

                <>

                  <div className="form-group">

                    <label>
                      Laundry Type *
                    </label>

                    <select
                      name="laundryType"
                      value={
                        form.laundryType
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select laundry type
                      </option>

                      <option>
                        Wash & Fold
                      </option>

                      <option>
                        Ironing
                      </option>

                      <option>
                        Dry Cleaning
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Quantity *
                    </label>

                    <input
                      type="number"
                      name="laundryQuantity"
                      min="1"
                      placeholder="Number of items"
                      value={
                        form.laundryQuantity
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Pickup / Delivery
                    </label>

                    <select
                      name="pickupDelivery"
                      value={
                        form.pickupDelivery
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        Drop Off
                      </option>

                      <option>
                        Pickup & Delivery
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* ================= PLUMBING ================= */}

              {service.name === "Plumbing" && (

                <>

                  <div className="form-group">

                    <label>
                      Plumbing Issue *
                    </label>

                    <select
                      name="plumbingIssue"
                      value={
                        form.plumbingIssue
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select issue
                      </option>

                      <option>
                        Leak Repair
                      </option>

                      <option>
                        Blocked Drain
                      </option>

                      <option>
                        Toilet Repair
                      </option>

                      <option>
                        Pipe Installation
                      </option>

                      <option>
                        General Plumbing
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Urgency *
                    </label>

                    <select
                      name="plumbingUrgency"
                      value={
                        form.plumbingUrgency
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        Normal
                      </option>

                      <option>
                        Urgent
                      </option>

                      <option>
                        Emergency
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* ================= ELECTRICAL ================= */}

              {service.name === "Electrical" && (

                <>

                  <div className="form-group">

                    <label>
                      Electrical Issue *
                    </label>

                    <select
                      name="electricalIssue"
                      value={
                        form.electricalIssue
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select issue
                      </option>

                      <option>
                        Electrical Repair
                      </option>

                      <option>
                        Wiring
                      </option>

                      <option>
                        Light Installation
                      </option>

                      <option>
                        Socket / Switch
                      </option>

                      <option>
                        Installation
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Number of Rooms
                    </label>

                    <input
                      type="number"
                      name="numberOfRooms"
                      min="1"
                      value={
                        form.numberOfRooms
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Urgency
                    </label>

                    <select
                      name="electricalUrgency"
                      value={
                        form.electricalUrgency
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        Normal
                      </option>

                      <option>
                        Urgent
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* ================= GARDENING ================= */}

              {service.name === "Gardening" && (

                <>

                  <div className="form-group">

                    <label>
                      Gardening Service *
                    </label>

                    <select
                      name="gardeningService"
                      value={
                        form.gardeningService
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select service
                      </option>

                      <option>
                        Lawn Mowing
                      </option>

                      <option>
                        Garden Maintenance
                      </option>

                      <option>
                        Tree Trimming
                      </option>

                      <option>
                        Landscaping
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Garden Size *
                    </label>

                    <select
                      name="gardenSize"
                      value={
                        form.gardenSize
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select size
                      </option>

                      <option>
                        Small
                      </option>

                      <option>
                        Medium
                      </option>

                      <option>
                        Large
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Frequency
                    </label>

                    <select
                      name="gardeningFrequency"
                      value={
                        form.gardeningFrequency
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        One-Time
                      </option>

                      <option>
                        Weekly
                      </option>

                      <option>
                        Bi-Weekly
                      </option>

                      <option>
                        Monthly
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* ================= PAINTING ================= */}

              {service.name === "Painting" && (

                <>

                  <div className="form-group">

                    <label>
                      Painting Type *
                    </label>

                    <select
                      name="paintingType"
                      value={
                        form.paintingType
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select type
                      </option>

                      <option>
                        Interior Painting
                      </option>

                      <option>
                        Exterior Painting
                      </option>

                      <option>
                        Room Painting
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Number of Rooms *
                    </label>

                    <input
                      type="number"
                      name="numberOfRoomsPainting"
                      min="1"
                      value={
                        form.numberOfRoomsPainting
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Wall Condition
                    </label>

                    <select
                      name="wallCondition"
                      value={
                        form.wallCondition
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select condition
                      </option>

                      <option>
                        Good
                      </option>

                      <option>
                        Average
                      </option>

                      <option>
                        Poor
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Will you provide the paint?
                    </label>

                    <select
                      name="paintProvided"
                      value={
                        form.paintProvided
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        No
                      </option>

                      <option>
                        Yes
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* ================= MOVING ================= */}

              {service.name === "Moving" && (

                <>

                  <div className="form-group">

                    <label>
                      Moving Type *
                    </label>

                    <select
                      name="movingType"
                      value={
                        form.movingType
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select moving type
                      </option>

                      <option>
                        House Moving
                      </option>

                      <option>
                        Office Moving
                      </option>

                      <option>
                        Single Item Moving
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Distance (KM) *
                    </label>

                    <input
                      type="number"
                      name="movingDistance"
                      min="1"
                      placeholder="e.g. 15"
                      value={
                        form.movingDistance
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Approximate Number of Items
                    </label>

                    <input
                      type="number"
                      name="numberOfItems"
                      min="1"
                      value={
                        form.numberOfItems
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Packing Required?
                    </label>

                    <select
                      name="packingRequired"
                      value={
                        form.packingRequired
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option>
                        No
                      </option>

                      <option>
                        Yes
                      </option>

                    </select>

                  </div>

                </>

              )}

            </div>

          </section>


          {/* =================================================
              DATE & TIME
          ================================================= */}

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

                <label>
                  Service Date *
                </label>

                <input
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

                <label>
                  Preferred Time *
                </label>

                <select
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
                      >
                        {slot}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </section>


          {/* =================================================
              LOCATION
          ================================================= */}

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
                  Where should the professional come?
                </p>

              </div>

            </div>


            <div className="form-grid">

              <div className="form-group full-width">

                <label>
                  Address *
                </label>

                <input
                  type="text"
                  name="address"
                  placeholder="Street / Building"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Nairobi"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Estate
                </label>

                <input
                  type="text"
                  name="estate"
                  placeholder="e.g. Kilimani"
                  value={form.estate}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>
                  House / Apartment Number
                </label>

                <input
                  type="text"
                  name="houseNumber"
                  placeholder="e.g. A12"
                  value={form.houseNumber}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CLEANING EXTRAS
          ================================================= */}

          {service.name === "Cleaning" && (

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
                    Add additional cleaning services.
                  </p>

                </div>

              </div>


              <div className="extras-grid">

                {cleaningExtrasList.map(
                  (extra) => {

                    const selected =
                      form.cleaningExtras.some(
                        (item) =>
                          item.name ===
                          extra.name
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
                            handleCleaningExtra(
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

          )}


          {/* =================================================
              NOTES
          ================================================= */}

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


          {/* =================================================
              PRICE SUMMARY
          ================================================= */}

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
                Service
              </span>

              <strong>
                Ksh{" "}
                {priceSummary.servicePrice.toLocaleString()}
              </strong>

            </div>


            {priceSummary.discount > 0 && (

              <div className="price-row discount">

                <span>
                  Discount
                </span>

                <strong>
                  - Ksh{" "}
                  {priceSummary.discount.toLocaleString()}
                </strong>

              </div>

            )}


            {priceSummary.extrasTotal > 0 && (

              <div className="price-row">

                <span>
                  Extras
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.extrasTotal.toLocaleString()}
                </strong>

              </div>

            )}


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


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="booking-submit"
          >
            Proceed to Checkout →
          </button>


          <p className="required-note">

            <span>*</span>

            {" "}
            Required fields

          </p>


        </form>

      </div>

    </div>

  );

}


export default Booking;