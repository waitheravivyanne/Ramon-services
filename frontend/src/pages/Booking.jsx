import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import services from "../data/services";
import "../styles/Booking.css";

/* =========================================================
   TIME SLOTS
========================================================= */

const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

/* =========================================================
   FREQUENCY DISCOUNTS
========================================================= */

const FREQUENCY_DISCOUNTS = {
  "One-Time": 0,
  Weekly: 0.1,
  "Bi-Weekly": 0.05,
  "Monthly Subscription": 0.15,
};

/* =========================================================
   CLEANING EXTRAS
========================================================= */

const CLEANING_EXTRAS = [
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

/* =========================================================
   CATEGORY CONFIGURATION
========================================================= */

const CATEGORY_CONFIG = {
  /* ---------------- CLEANING ---------------- */

  101: {
    service: "Cleaning",
    category: "House Cleaning",
    type: "houseCleaning",
    basePrice: 1500,
  },

  102: {
    service: "Cleaning",
    category: "Office Cleaning",
    type: "officeCleaning",
    basePrice: 2500,
  },

  103: {
    service: "Cleaning",
    category: "Window Cleaning",
    type: "windowCleaning",
    basePrice: 1000,
  },

  104: {
    service: "Cleaning",
    category: "Carpet Cleaning",
    type: "carpetCleaning",
    basePrice: 1500,
  },

  105: {
    service: "Cleaning",
    category: "Sofa Cleaning",
    type: "sofaCleaning",
    basePrice: 1200,
  },

  /* ---------------- LAUNDRY ---------------- */

  201: {
    service: "Laundry",
    category: "Wash & Fold",
    type: "washFold",
    basePrice: 800,
  },

  202: {
    service: "Laundry",
    category: "Ironing",
    type: "ironing",
    basePrice: 500,
  },

  203: {
    service: "Laundry",
    category: "Dry Cleaning",
    type: "dryCleaning",
    basePrice: 1000,
  },

  /* ---------------- PLUMBING ---------------- */

  301: {
    service: "Plumbing",
    category: "Leak Repair",
    type: "leakRepair",
    basePrice: 1000,
  },

  302: {
    service: "Plumbing",
    category: "Blocked Drain",
    type: "blockedDrain",
    basePrice: 1500,
  },

  303: {
    service: "Plumbing",
    category: "Pipe Installation",
    type: "pipeInstallation",
    basePrice: 2500,
  },

  /* ---------------- ELECTRICAL ---------------- */

  401: {
    service: "Electrical",
    category: "Electrical Repair",
    type: "electricalRepair",
    basePrice: 1500,
  },

  402: {
    service: "Electrical",
    category: "Socket Installation",
    type: "socketInstallation",
    basePrice: 1000,
  },

  403: {
    service: "Electrical",
    category: "Lighting Installation",
    type: "lightingInstallation",
    basePrice: 1500,
  },

  /* ---------------- GARDENING ---------------- */

  501: {
    service: "Gardening",
    category: "Lawn Maintenance",
    type: "lawnMaintenance",
    basePrice: 1000,
  },

  502: {
    service: "Gardening",
    category: "Garden Cleaning",
    type: "gardenCleaning",
    basePrice: 1200,
  },

  503: {
    service: "Gardening",
    category: "Landscaping",
    type: "landscaping",
    basePrice: 3000,
  },

  /* ---------------- PAINTING ---------------- */

  601: {
    service: "Painting",
    category: "Interior Painting",
    type: "interiorPainting",
    basePrice: 3000,
  },

  602: {
    service: "Painting",
    category: "Exterior Painting",
    type: "exteriorPainting",
    basePrice: 4000,
  },

  603: {
    service: "Painting",
    category: "Room Painting",
    type: "roomPainting",
    basePrice: 2000,
  },

  /* ---------------- MOVING ---------------- */

  701: {
    service: "Moving",
    category: "House Moving",
    type: "houseMoving",
    basePrice: 5000,
  },

  702: {
    service: "Moving",
    category: "Office Moving",
    type: "officeMoving",
    basePrice: 7000,
  },

  703: {
    service: "Moving",
    category: "Packing Service",
    type: "packingService",
    basePrice: 2500,
  },
};

/* =========================================================
   COMPONENT
========================================================= */

function Booking() {
  const navigate = useNavigate();

  const { serviceId, categoryId } = useParams();

  const numericServiceId = Number(serviceId);
  const numericCategoryId = Number(categoryId);

  const service = services?.find(
    (item) => Number(item.id) === numericServiceId
  );

  const config = CATEGORY_CONFIG[numericCategoryId];

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [form, setForm] = useState({
    /* General information */
    date: "",
    time: "",
    address: "",
    city: "",
    estate: "",
    houseNumber: "",
    notes: "",

    /* House cleaning */
    houseSize: "Bedsitter",
    cleaningLevel: "Standard Cleaning",
    frequency: "One-Time",
    cleaningExtras: [],

    /* Office cleaning */
    officeSize: "Small",
    officeRooms: 1,
    officeCleaningLevel: "Standard Cleaning",
    officeFrequency: "One-Time",

    /* Window cleaning */
    numberOfWindows: 1,
    windowHeight: "Ground Floor",
    windowSide: "Inside Only",

    /* Carpet cleaning */
    numberOfCarpets: 1,
    carpetSize: "Small",
    carpetTreatment: "Standard Cleaning",

    /* Sofa cleaning */
    sofaSeats: 1,
    sofaMaterial: "Fabric",
    sofaTreatment: "Standard Cleaning",

    /* Laundry */
    laundryQuantity: 1,
    pickupDelivery: "Customer Drop-off",

    /* Plumbing */
    plumbingAreas: "",
    plumbingUrgency: "Normal",
    plumbingDescription: "",

    /* Electrical */
    electricalPoints: 1,
    electricalUrgency: "Normal",
    electricalDescription: "",

    /* Gardening */
    gardenSize: "Small",
    gardeningFrequency: "One-Time",
    gardeningDescription: "",

    /* Painting */
    paintingRooms: 1,
    wallCondition: "Good",
    paintProvided: "Customer Provides Paint",
    paintingArea: "Interior",

    /* Moving */
    movingDistance: "Within Same Estate",
    numberOfItems: 1,
    packingRequired: "No",
    movingFloor: "Ground Floor",
    movingDescription: "",
  });

  /* =======================================================
     GENERIC CHANGE HANDLER
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     CLEANING EXTRA TOGGLE
  ======================================================= */

  const toggleCleaningExtra = (extra) => {
    setForm((previous) => {
      const exists = previous.cleaningExtras.some(
        (item) => item.name === extra.name
      );

      if (exists) {
        return {
          ...previous,
          cleaningExtras: previous.cleaningExtras.filter(
            (item) => item.name !== extra.name
          ),
        };
      }

      return {
        ...previous,
        cleaningExtras: [...previous.cleaningExtras, extra],
      };
    });
  };

  /* =======================================================
     PRICE CALCULATION
  ======================================================= */

  const priceSummary = useMemo(() => {
    let basePrice = 0;
    let discount = 0;
    let extrasTotal = 0;
    let subtotal = 0;

    /* =====================================================
       HOUSE CLEANING
    ===================================================== */

    if (config?.type === "houseCleaning") {
      const houseMultipliers = {
        Bedsitter: 1,
        "1 Bedroom": 1.3,
        "2 Bedroom": 1.7,
        "3 Bedroom": 2.1,
        "4 Bedroom": 2.6,
        "5+ Bedroom": 3.2,
      };

      const cleaningMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Move In / Move Out": 1.8,
        "Post Construction": 2,
        Fumigation: 2.5,
      };

      const houseMultiplier =
        houseMultipliers[form.houseSize] || 1;

      const cleaningMultiplier =
        cleaningMultipliers[form.cleaningLevel] || 1;

      basePrice = Math.round(
        config.basePrice *
          houseMultiplier *
          cleaningMultiplier
      );

      const discountRate =
        FREQUENCY_DISCOUNTS[form.frequency] || 0;

      discount = Math.round(basePrice * discountRate);

      extrasTotal = form.cleaningExtras.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
      );

      subtotal = basePrice - discount + extrasTotal;
    }

    /* =====================================================
       OFFICE CLEANING
    ===================================================== */

    else if (config?.type === "officeCleaning") {
      const officePrices = {
        Small: 2500,
        Medium: 4000,
        Large: 6500,
      };

      const levelMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Post Construction": 2,
      };

      const officeBase =
        officePrices[form.officeSize] || 2500;

      const levelMultiplier =
        levelMultipliers[form.officeCleaningLevel] || 1;

      const additionalRooms =
        Math.max(Number(form.officeRooms) - 3, 0) * 500;

      basePrice = Math.round(
        officeBase * levelMultiplier + additionalRooms
      );

      const discountRate =
        FREQUENCY_DISCOUNTS[form.officeFrequency] || 0;

      discount = Math.round(basePrice * discountRate);

      subtotal = basePrice - discount;
    }

    /* =====================================================
       WINDOW CLEANING
    ===================================================== */

    else if (config?.type === "windowCleaning") {
      const windows = Number(form.numberOfWindows) || 1;

      let pricePerWindow = 1;

      if (form.windowHeight === "Upper Floor") {
        pricePerWindow += 100;
      }

      if (form.windowSide === "Inside & Outside") {
        pricePerWindow += 100;
      }

      basePrice = windows * pricePerWindow;

      subtotal = basePrice;
    }

    /* =====================================================
       CARPET CLEANING
    ===================================================== */

    else if (config?.type === "carpetCleaning") {
      const carpetSizePrices = {
        Small: 1000,
        Medium: 1500,
        Large: 2200,
      };

      const treatmentMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Stain Removal": 1.8,
      };

      const sizePrice =
        carpetSizePrices[form.carpetSize] || 1000;

      const treatmentMultiplier =
        treatmentMultipliers[form.carpetTreatment] || 1;

      basePrice = Math.round(
        Number(form.numberOfCarpets || 1) *
          sizePrice *
          treatmentMultiplier
      );

      subtotal = basePrice;
    }

    /* =====================================================
       SOFA CLEANING
    ===================================================== */

    else if (config?.type === "sofaCleaning") {
      const materialPrices = {
        Fabric: 1200,
        Leather: 1500,
        Suede: 1800,
      };

      const treatmentMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Stain Removal": 1.7,
      };

      const materialPrice =
        materialPrices[form.sofaMaterial] || 1200;

      const treatmentMultiplier =
        treatmentMultipliers[form.sofaTreatment] || 1;

      basePrice = Math.round(
        Number(form.sofaSeats || 1) *
          materialPrice *
          treatmentMultiplier
      );

      subtotal = basePrice;
    }

    /* =====================================================
       LAUNDRY
    ===================================================== */

    else if (
      config?.type === "washFold" ||
      config?.type === "ironing" ||
      config?.type === "dryCleaning"
    ) {
      const quantity = Number(form.laundryQuantity) || 1;

      let price = config.basePrice;

      if (form.pickupDelivery === "Pickup & Delivery") {
        price += 300;
      }

      basePrice = quantity * price;

      subtotal = basePrice;
    }

    /* =====================================================
       PLUMBING
    ===================================================== */

    else if (
      config?.type === "leakRepair" ||
      config?.type === "blockedDrain" ||
      config?.type === "pipeInstallation"
    ) {
      const urgencyPrices = {
        Normal: 0,
        Urgent: 500,
        Emergency: 1000,
      };

      basePrice = config.basePrice;

      basePrice +=
        urgencyPrices[form.plumbingUrgency] || 0;

      subtotal = basePrice;
    }

    /* =====================================================
       ELECTRICAL
    ===================================================== */

    else if (
      config?.type === "electricalRepair" ||
      config?.type === "socketInstallation" ||
      config?.type === "lightingInstallation"
    ) {
      const urgencyPrices = {
        Normal: 0,
        Urgent: 500,
        Emergency: 1000,
      };

      const points =
        Number(form.electricalPoints) || 1;

      basePrice =
        config.basePrice +
        Math.max(points - 1, 0) * 300;

      basePrice +=
        urgencyPrices[form.electricalUrgency] || 0;

      subtotal = basePrice;
    }

    /* =====================================================
       GARDENING
    ===================================================== */

    else if (
      config?.type === "lawnMaintenance" ||
      config?.type === "gardenCleaning" ||
      config?.type === "landscaping"
    ) {
      const gardenMultipliers = {
        Small: 1,
        Medium: 1.5,
        Large: 2.2,
      };

      const frequencyMultipliers = {
        "One-Time": 1,
        Weekly: 0.9,
        "Bi-Weekly": 0.95,
        Monthly: 0.97,
      };

      const gardenMultiplier =
        gardenMultipliers[form.gardenSize] || 1;

      const frequencyMultiplier =
        frequencyMultipliers[form.gardeningFrequency] || 1;

      basePrice = Math.round(
        config.basePrice *
          gardenMultiplier *
          frequencyMultiplier
      );

      subtotal = basePrice;
    }

    /* =====================================================
       PAINTING
    ===================================================== */

    else if (
      config?.type === "interiorPainting" ||
      config?.type === "exteriorPainting" ||
      config?.type === "roomPainting"
    ) {
      const roomCount =
        Number(form.paintingRooms) || 1;

      const wallConditionPrices = {
        Good: 0,
        "Needs Preparation": 1000,
        "Damaged Walls": 2000,
      };

      const paintPrices = {
        "Customer Provides Paint": 0,
        "Ramon's Marketplace Provides Paint": 2500,
      };

      basePrice =
        config.basePrice * roomCount;

      basePrice +=
        wallConditionPrices[form.wallCondition] || 0;

      basePrice +=
        paintPrices[form.paintProvided] || 0;

      subtotal = basePrice;
    }

    /* =====================================================
       MOVING
    ===================================================== */

    else if (
      config?.type === "houseMoving" ||
      config?.type === "officeMoving" ||
      config?.type === "packingService"
    ) {
      const distancePrices = {
        "Within Same Estate": 0,
        "Within Same Town": 1500,
        "Within Same County": 3000,
        "Outside County": 5000,
      };

      const floorPrices = {
        "Ground Floor": 0,
        "1st Floor": 500,
        "2nd Floor": 1000,
        "3rd Floor or Higher": 1500,
      };

      const packingPrices = {
        No: 0,
        Yes: 1500,
      };

      const items =
        Number(form.numberOfItems) || 1;

      basePrice =
        config.basePrice +
        Math.max(items - 5, 0) * 300;

      basePrice +=
        distancePrices[form.movingDistance] || 0;

      basePrice +=
        floorPrices[form.movingFloor] || 0;

      basePrice +=
        packingPrices[form.packingRequired] || 0;

      subtotal = basePrice;
    }

    return {
      basePrice,
      discount,
      extrasTotal,
      total: Math.max(0, subtotal),
    };
  }, [config, form]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateBooking = () => {
    if (!serviceId || Number.isNaN(numericServiceId)) {
      alert("The selected service is invalid.");
      return false;
    }

    if (!categoryId || Number.isNaN(numericCategoryId)) {
      alert("The selected service category is invalid.");
      return false;
    }

    if (!config) {
      alert("This service category could not be found.");
      return false;
    }

    if (!form.date) {
      alert("Please select your preferred date.");
      return false;
    }

    if (!form.time) {
      alert("Please select your preferred time.");
      return false;
    }

    if (!form.address.trim()) {
      alert("Please enter your address.");
      return false;
    }

    if (!form.city.trim()) {
      alert("Please enter your city.");
      return false;
    }

    if (!form.estate.trim()) {
      alert("Please enter your estate/area.");
      return false;
    }

    if (priceSummary.total <= 0) {
      alert("The booking total must be greater than zero.");
      return false;
    }

    return true;
  };

  /* =======================================================
     PROCEED TO CHECKOUT
  ======================================================= */

  const proceedToCheckout = () => {
    if (!validateBooking()) {
      return;
    }

    /*
      IMPORTANT:

      This object is what gets passed to Checkout.jsx.

      We deliberately include both cleaningLevel and
      cleaningType because your existing Checkout.jsx
      expects cleaningType while the form uses cleaningLevel.
    */

    const bookingData = {
      ...form,

      serviceId: numericServiceId,

      categoryId: numericCategoryId,

      serviceName:
        service?.name ||
        config?.service ||
        "Service",

      categoryName:
        config?.category ||
        "Service Category",

      /* Fix for cleaning naming mismatch */
      cleaningType:
        form.cleaningLevel || "",

      cleaningLevel:
        form.cleaningLevel || "",

      /* Normalize extras */
      extras:
        form.cleaningExtras || [],

      /* Price */
      total:
        Number(priceSummary.total) || 0,

      /* Useful category information */
      serviceType:
        config?.type || "",

      categoryType:
        config?.type || "",
    };

    console.log(
      "BOOKING DATA BEING SENT TO CHECKOUT:",
      bookingData
    );

    navigate("/checkout", {
      state: {
        booking: bookingData,
        total: Number(priceSummary.total) || 0,
      },
    });
  };

  /* =======================================================
     IF SERVICE NOT FOUND
  ======================================================= */

  if (!config) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-error">
            <h2>Service Not Found</h2>

            <p>
              The service category you selected could not
              be found.
            </p>

            <button
              type="button"
              onClick={() => navigate("/services")}
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="booking-page">

      <div className="booking-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="booking-header">

          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1>
            Book {config.category}
          </h1>

          <p>
            Tell us what you need and choose your preferred
            date and time.
          </p>

        </div>

        {/* =================================================
            SERVICE INFORMATION
        ================================================= */}

        <div className="booking-service-info">

          <div>
            <span>Service</span>
            <strong>
              {service?.name || config.service}
            </strong>
          </div>

          <div>
            <span>Category</span>
            <strong>
              {config.category}
            </strong>
          </div>

        </div>

        {/* =================================================
            GENERAL BOOKING INFORMATION
        ================================================= */}

        <section className="booking-section">

          <h2>1. Appointment Details</h2>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="date">
                Preferred Date
              </label>

              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
              />

            </div>

            <div className="form-group">

              <label htmlFor="time">
                Preferred Time
              </label>

              <select
                id="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              >

                <option value="">
                  Select Time
                </option>

                {TIME_SLOTS.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>

        {/* =================================================
            LOCATION
        ================================================= */}

        <section className="booking-section">

          <h2>2. Service Location</h2>

          <div className="form-grid">

            <div className="form-group full-width">

              <label htmlFor="address">
                Physical Address
              </label>

              <input
                id="address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your physical address"
              />

            </div>

            <div className="form-group">

              <label htmlFor="city">
                City / Town
              </label>

              <input
                id="city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Nairobi"
              />

            </div>

            <div className="form-group">

              <label htmlFor="estate">
                Estate / Area
              </label>

              <input
                id="estate"
                type="text"
                name="estate"
                value={form.estate}
                onChange={handleChange}
                placeholder="e.g. Kilimani"
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
                value={form.houseNumber}
                onChange={handleChange}
                placeholder="e.g. House A12"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            HOUSE CLEANING
        ================================================= */}

        {config.type === "houseCleaning" && (
          <section className="booking-section">

            <h2>3. House Cleaning Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="houseSize">
                  House Size
                </label>

                <select
                  id="houseSize"
                  name="houseSize"
                  value={form.houseSize}
                  onChange={handleChange}
                >

                  <option value="Bedsitter">
                    Bedsitter
                  </option>

                  <option value="1 Bedroom">
                    1 Bedroom
                  </option>

                  <option value="2 Bedroom">
                    2 Bedroom
                  </option>

                  <option value="3 Bedroom">
                    3 Bedroom
                  </option>

                  <option value="4 Bedroom">
                    4 Bedroom
                  </option>

                  <option value="5+ Bedroom">
                    5+ Bedroom
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="cleaningLevel">
                  Cleaning Type
                </label>

                <select
                  id="cleaningLevel"
                  name="cleaningLevel"
                  value={form.cleaningLevel}
                  onChange={handleChange}
                >

                  <option value="Standard Cleaning">
                    Standard Cleaning
                  </option>

                  <option value="Deep Cleaning">
                    Deep Cleaning
                  </option>

                  <option value="Move In / Move Out">
                    Move In / Move Out
                  </option>

                  <option value="Post Construction">
                    Post Construction
                  </option>

                  <option value="Fumigation">
                    Fumigation
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="frequency">
                  Cleaning Frequency
                </label>

                <select
                  id="frequency"
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                >

                  <option value="One-Time">
                    One-Time
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="Bi-Weekly">
                    Bi-Weekly
                  </option>

                  <option value="Monthly Subscription">
                    Monthly Subscription
                  </option>

                </select>

              </div>

            </div>

            <div className="extras-section">

              <h3>Additional Services</h3>

              <div className="extras-grid">

                {CLEANING_EXTRAS.map((extra) => {

                  const selected =
                    form.cleaningExtras.some(
                      (item) =>
                        item.name === extra.name
                    );

                  return (
                    <label
                      key={extra.name}
                      className={`extra-item ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleCleaningExtra(extra)
                        }
                      />

                      <span>
                        {extra.name}
                      </span>

                      <strong>
                        + KSh{" "}
                        {extra.price.toLocaleString()}
                      </strong>

                    </label>
                  );
                })}

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            OFFICE CLEANING
        ================================================= */}

        {config.type === "officeCleaning" && (
          <section className="booking-section">

            <h2>3. Office Cleaning Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="officeSize">
                  Office Size
                </label>

                <select
                  id="officeSize"
                  name="officeSize"
                  value={form.officeSize}
                  onChange={handleChange}
                >

                  <option value="Small">
                    Small Office
                  </option>

                  <option value="Medium">
                    Medium Office
                  </option>

                  <option value="Large">
                    Large Office
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="officeRooms">
                  Number of Rooms
                </label>

                <input
                  id="officeRooms"
                  type="number"
                  name="officeRooms"
                  min="1"
                  value={form.officeRooms}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="officeCleaningLevel">
                  Cleaning Type
                </label>

                <select
                  id="officeCleaningLevel"
                  name="officeCleaningLevel"
                  value={form.officeCleaningLevel}
                  onChange={handleChange}
                >

                  <option value="Standard Cleaning">
                    Standard Cleaning
                  </option>

                  <option value="Deep Cleaning">
                    Deep Cleaning
                  </option>

                  <option value="Post Construction">
                    Post Construction
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="officeFrequency">
                  Frequency
                </label>

                <select
                  id="officeFrequency"
                  name="officeFrequency"
                  value={form.officeFrequency}
                  onChange={handleChange}
                >

                  <option value="One-Time">
                    One-Time
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="Bi-Weekly">
                    Bi-Weekly
                  </option>

                  <option value="Monthly Subscription">
                    Monthly Subscription
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            WINDOW CLEANING
        ================================================= */}

        {config.type === "windowCleaning" && (
          <section className="booking-section">

            <h2>3. Window Cleaning Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="numberOfWindows">
                  Number of Windows
                </label>

                <input
                  id="numberOfWindows"
                  type="number"
                  min="1"
                  name="numberOfWindows"
                  value={form.numberOfWindows}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="windowHeight">
                  Building Level
                </label>

                <select
                  id="windowHeight"
                  name="windowHeight"
                  value={form.windowHeight}
                  onChange={handleChange}
                >

                  <option value="Ground Floor">
                    Ground Floor
                  </option>

                  <option value="Upper Floor">
                    Upper Floor
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="windowSide">
                  Cleaning Side
                </label>

                <select
                  id="windowSide"
                  name="windowSide"
                  value={form.windowSide}
                  onChange={handleChange}
                >

                  <option value="Inside Only">
                    Inside Only
                  </option>

                  <option value="Outside Only">
                    Outside Only
                  </option>

                  <option value="Inside & Outside">
                    Inside & Outside
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            CARPET CLEANING
        ================================================= */}

        {config.type === "carpetCleaning" && (
          <section className="booking-section">

            <h2>3. Carpet Cleaning Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="numberOfCarpets">
                  Number of Carpets
                </label>

                <input
                  id="numberOfCarpets"
                  type="number"
                  min="1"
                  name="numberOfCarpets"
                  value={form.numberOfCarpets}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="carpetSize">
                  Carpet Size
                </label>

                <select
                  id="carpetSize"
                  name="carpetSize"
                  value={form.carpetSize}
                  onChange={handleChange}
                >

                  <option value="Small">
                    Small
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Large">
                    Large
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="carpetTreatment">
                  Treatment
                </label>

                <select
                  id="carpetTreatment"
                  name="carpetTreatment"
                  value={form.carpetTreatment}
                  onChange={handleChange}
                >

                  <option value="Standard Cleaning">
                    Standard Cleaning
                  </option>

                  <option value="Deep Cleaning">
                    Deep Cleaning
                  </option>

                  <option value="Stain Removal">
                    Stain Removal
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            SOFA CLEANING
        ================================================= */}

        {config.type === "sofaCleaning" && (
          <section className="booking-section">

            <h2>3. Sofa Cleaning Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="sofaSeats">
                  Number of Seats
                </label>

                <input
                  id="sofaSeats"
                  type="number"
                  min="1"
                  name="sofaSeats"
                  value={form.sofaSeats}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="sofaMaterial">
                  Sofa Material
                </label>

                <select
                  id="sofaMaterial"
                  name="sofaMaterial"
                  value={form.sofaMaterial}
                  onChange={handleChange}
                >

                  <option value="Fabric">
                    Fabric
                  </option>

                  <option value="Leather">
                    Leather
                  </option>

                  <option value="Suede">
                    Suede
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="sofaTreatment">
                  Treatment
                </label>

                <select
                  id="sofaTreatment"
                  name="sofaTreatment"
                  value={form.sofaTreatment}
                  onChange={handleChange}
                >

                  <option value="Standard Cleaning">
                    Standard Cleaning
                  </option>

                  <option value="Deep Cleaning">
                    Deep Cleaning
                  </option>

                  <option value="Stain Removal">
                    Stain Removal
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            LAUNDRY
        ================================================= */}

        {[
          "washFold",
          "ironing",
          "dryCleaning",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Laundry Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="laundryQuantity">
                  Quantity
                </label>

                <input
                  id="laundryQuantity"
                  type="number"
                  min="1"
                  name="laundryQuantity"
                  value={form.laundryQuantity}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="pickupDelivery">
                  Collection Method
                </label>

                <select
                  id="pickupDelivery"
                  name="pickupDelivery"
                  value={form.pickupDelivery}
                  onChange={handleChange}
                >

                  <option value="Customer Drop-off">
                    Customer Drop-off
                  </option>

                  <option value="Pickup & Delivery">
                    Pickup & Delivery
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            PLUMBING
        ================================================= */}

        {[
          "leakRepair",
          "blockedDrain",
          "pipeInstallation",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Plumbing Details</h2>

            <div className="form-grid">

              <div className="form-group full-width">

                <label htmlFor="plumbingAreas">
                  Affected Area
                </label>

                <input
                  id="plumbingAreas"
                  type="text"
                  name="plumbingAreas"
                  value={form.plumbingAreas}
                  onChange={handleChange}
                  placeholder="e.g. Kitchen sink, bathroom, toilet"
                />

              </div>

              <div className="form-group">

                <label htmlFor="plumbingUrgency">
                  Urgency
                </label>

                <select
                  id="plumbingUrgency"
                  name="plumbingUrgency"
                  value={form.plumbingUrgency}
                  onChange={handleChange}
                >

                  <option value="Normal">
                    Normal
                  </option>

                  <option value="Urgent">
                    Urgent
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label htmlFor="plumbingDescription">
                  Describe the Problem
                </label>

                <textarea
                  id="plumbingDescription"
                  name="plumbingDescription"
                  value={form.plumbingDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the plumbing problem..."
                />

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            ELECTRICAL
        ================================================= */}

        {[
          "electricalRepair",
          "socketInstallation",
          "lightingInstallation",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Electrical Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="electricalPoints">
                  Number of Points
                </label>

                <input
                  id="electricalPoints"
                  type="number"
                  min="1"
                  name="electricalPoints"
                  value={form.electricalPoints}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="electricalUrgency">
                  Urgency
                </label>

                <select
                  id="electricalUrgency"
                  name="electricalUrgency"
                  value={form.electricalUrgency}
                  onChange={handleChange}
                >

                  <option value="Normal">
                    Normal
                  </option>

                  <option value="Urgent">
                    Urgent
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label htmlFor="electricalDescription">
                  Describe the Work Required
                </label>

                <textarea
                  id="electricalDescription"
                  name="electricalDescription"
                  value={form.electricalDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the electrical work..."
                />

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            GARDENING
        ================================================= */}

        {[
          "lawnMaintenance",
          "gardenCleaning",
          "landscaping",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Gardening Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="gardenSize">
                  Garden Size
                </label>

                <select
                  id="gardenSize"
                  name="gardenSize"
                  value={form.gardenSize}
                  onChange={handleChange}
                >

                  <option value="Small">
                    Small
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Large">
                    Large
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="gardeningFrequency">
                  Frequency
                </label>

                <select
                  id="gardeningFrequency"
                  name="gardeningFrequency"
                  value={form.gardeningFrequency}
                  onChange={handleChange}
                >

                  <option value="One-Time">
                    One-Time
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="Bi-Weekly">
                    Bi-Weekly
                  </option>

                  <option value="Monthly">
                    Monthly
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label htmlFor="gardeningDescription">
                  Gardening Requirements
                </label>

                <textarea
                  id="gardeningDescription"
                  name="gardeningDescription"
                  value={form.gardeningDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the gardening work required..."
                />

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            PAINTING
        ================================================= */}

        {[
          "interiorPainting",
          "exteriorPainting",
          "roomPainting",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Painting Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="paintingRooms">
                  Number of Rooms
                </label>

                <input
                  id="paintingRooms"
                  type="number"
                  min="1"
                  name="paintingRooms"
                  value={form.paintingRooms}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="wallCondition">
                  Wall Condition
                </label>

                <select
                  id="wallCondition"
                  name="wallCondition"
                  value={form.wallCondition}
                  onChange={handleChange}
                >

                  <option value="Good">
                    Good
                  </option>

                  <option value="Needs Preparation">
                    Needs Preparation
                  </option>

                  <option value="Damaged Walls">
                    Damaged Walls
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="paintProvided">
                  Paint
                </label>

                <select
                  id="paintProvided"
                  name="paintProvided"
                  value={form.paintProvided}
                  onChange={handleChange}
                >

                  <option value="Customer Provides Paint">
                    Customer Provides Paint
                  </option>

                  <option value="Ramon's Marketplace Provides Paint">
                    Ramon&apos;s Marketplace Provides Paint
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="paintingArea">
                  Painting Area
                </label>

                <select
                  id="paintingArea"
                  name="paintingArea"
                  value={form.paintingArea}
                  onChange={handleChange}
                >

                  <option value="Interior">
                    Interior
                  </option>

                  <option value="Exterior">
                    Exterior
                  </option>

                  <option value="Both">
                    Both
                  </option>

                </select>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            MOVING
        ================================================= */}

        {[
          "houseMoving",
          "officeMoving",
          "packingService",
        ].includes(config.type) && (
          <section className="booking-section">

            <h2>3. Moving Details</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="movingDistance">
                  Moving Distance
                </label>

                <select
                  id="movingDistance"
                  name="movingDistance"
                  value={form.movingDistance}
                  onChange={handleChange}
                >

                  <option value="Within Same Estate">
                    Within Same Estate
                  </option>

                  <option value="Within Same Town">
                    Within Same Town
                  </option>

                  <option value="Within Same County">
                    Within Same County
                  </option>

                  <option value="Outside County">
                    Outside County
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="numberOfItems">
                  Number of Items
                </label>

                <input
                  id="numberOfItems"
                  type="number"
                  min="1"
                  name="numberOfItems"
                  value={form.numberOfItems}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="packingRequired">
                  Packing Required?
                </label>

                <select
                  id="packingRequired"
                  name="packingRequired"
                  value={form.packingRequired}
                  onChange={handleChange}
                >

                  <option value="No">
                    No
                  </option>

                  <option value="Yes">
                    Yes
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="movingFloor">
                  Current Floor
                </label>

                <select
                  id="movingFloor"
                  name="movingFloor"
                  value={form.movingFloor}
                  onChange={handleChange}
                >

                  <option value="Ground Floor">
                    Ground Floor
                  </option>

                  <option value="1st Floor">
                    1st Floor
                  </option>

                  <option value="2nd Floor">
                    2nd Floor
                  </option>

                  <option value="3rd Floor or Higher">
                    3rd Floor or Higher
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label htmlFor="movingDescription">
                  Moving Details
                </label>

                <textarea
                  id="movingDescription"
                  name="movingDescription"
                  value={form.movingDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the items and moving requirements..."
                />

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            NOTES
        ================================================= */}

        <section className="booking-section">

          <h2>4. Additional Notes</h2>

          <div className="form-group">

            <label htmlFor="notes">
              Additional Information
            </label>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="5"
              placeholder="Add any other information that will help our service provider..."
            />

          </div>

        </section>

        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        <section className="price-summary">

          <h2>Price Summary</h2>

          <div className="price-row">

            <span>
              Base Price
            </span>

            <strong>
              KSh{" "}
              {priceSummary.basePrice.toLocaleString()}
            </strong>

          </div>

          {priceSummary.discount > 0 && (
            <div className="price-row discount">

              <span>
                Frequency Discount
              </span>

              <strong>
                - KSh{" "}
                {priceSummary.discount.toLocaleString()}
              </strong>

            </div>
          )}

          {priceSummary.extrasTotal > 0 && (
            <div className="price-row">

              <span>
                Additional Services
              </span>

              <strong>
                KSh{" "}
                {priceSummary.extrasTotal.toLocaleString()}
              </strong>

            </div>
          )}

          <div className="price-divider" />

          <div className="price-row total-row">

            <span>
              Total
            </span>

            <strong>
              KSh{" "}
              {priceSummary.total.toLocaleString()}
            </strong>

          </div>

        </section>

       
{/* =================================================
    FINAL BOOKING ACTION
================================================= */}

<section className="booking-final-action">

  <div className="final-action-content">

    <div>
      <h2>Ready to Book?</h2>

      <p>
        Review your booking details and continue to
        secure your service appointment.
      </p>

      <div className="final-total">
        <span>Total to Pay</span>

        <strong>
          KSh {priceSummary.total.toLocaleString()}
        </strong>
      </div>
    </div>

    <button
      type="button"
      className="checkout-button"
      onClick={proceedToCheckout}
    >
      Continue to Payment →
    </button>

  </div>

</section>

      </div>

    </div>
  );
}

export default Booking;