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
  Weekly: 0.10,
  "Bi-Weekly": 0.05,
  "Monthly Subscription": 0.15,
};

/* =========================================================
   CLEANING EXTRAS
========================================================= */

const CLEANING_EXTRAS = [
  { name: "Inside Fridge", price: 500 },
  { name: "Inside Oven", price: 400 },
  { name: "Balcony Cleaning", price: 300 },
  { name: "Laundry", price: 700 },
  { name: "Ironing", price: 500 },
  { name: "Pest Control / Fumigation", price: 2500 },
];

/* =========================================================
   NO-API MOVING AREAS
   Coordinates are reference points for estimation only.
========================================================= */

const MOVING_AREAS = {
  "Nairobi CBD": {
    lat: -1.286389,
    lng: 36.817223,
  },

  Westlands: {
    lat: -1.2676,
    lng: 36.8108,
  },

  Kilimani: {
    lat: -1.2921,
    lng: 36.7875,
  },

  Lavington: {
    lat: -1.2817,
    lng: 36.7784,
  },

  Kileleshwa: {
    lat: -1.2862,
    lng: 36.7675,
  },

  Hurlingham: {
    lat: -1.3027,
    lng: 36.8057,
  },

  "South B": {
    lat: -1.3151,
    lng: 36.8326,
  },

  "South C": {
    lat: -1.3134,
    lng: 36.8121,
  },

  Langata: {
    lat: -1.3627,
    lng: 36.7574,
  },

  Karen: {
    lat: -1.3197,
    lng: 36.7073,
  },

  Rongai: {
    lat: -1.3966,
    lng: 36.7463,
  },

  Ngong: {
    lat: -1.3612,
    lng: 36.6566,
  },

  Runda: {
    lat: -1.2041,
    lng: 36.8068,
  },

  Gigiri: {
    lat: -1.2321,
    lng: 36.8036,
  },

  Muthaiga: {
    lat: -1.2466,
    lng: 36.8274,
  },

  Kasarani: {
    lat: -1.2226,
    lng: 36.8969,
  },

  Roysambu: {
    lat: -1.2186,
    lng: 36.8845,
  },

  Zimmerman: {
    lat: -1.208,
    lng: 36.888,
  },

  Ruaka: {
    lat: -1.2026,
    lng: 36.7721,
  },

  Kiambu: {
    lat: -1.1714,
    lng: 36.8356,
  },

  Ruiru: {
    lat: -1.1458,
    lng: 36.9617,
  },

  Thika: {
    lat: -1.0333,
    lng: 37.0693,
  },

  Syokimau: {
    lat: -1.3591,
    lng: 36.9189,
  },

  "Athi River": {
    lat: -1.4507,
    lng: 36.982,
  },

  Kitengela: {
    lat: -1.4793,
    lng: 36.958,
  },

  Embakasi: {
    lat: -1.3186,
    lng: 36.8947,
  },

  Donholm: {
    lat: -1.3009,
    lng: 36.882,
  },

  Buruburu: {
    lat: -1.2894,
    lng: 36.872,
  },

  Umoja: {
    lat: -1.285,
    lng: 36.894,
  },

  Ruai: {
    lat: -1.2808,
    lng: 36.9797,
  },
};

/*
  Straight-line distance is converted to an estimated
  road distance.

  IMPORTANT:
  This is an estimate, NOT live GPS road routing.
*/

const ROAD_DISTANCE_FACTOR = 1.30;

/*
  Moving distance rate.
*/

const MOVING_DISTANCE_RATE = 180;

/* =========================================================
   MOVING PRICING
========================================================= */

const MOVING_PROPERTY_PRICES = {
  Bedsitter: 0,
  "1 Bedroom": 500,
  "2 Bedrooms": 1000,
  "3 Bedrooms": 1500,
  "4 Bedrooms": 2000,
  "5+ Bedrooms": 3000,
  Office: 2000,
  "Small Business": 3000,
};

const MOVING_EXTRAS = [
  {
    key: "packing",
    name: "Packing Assistance",
    price: 1500,
  },
  {
    key: "fragile",
    name: "Fragile Items Handling",
    price: 1000,
  },
  {
    key: "dismantling",
    name: "Furniture Dismantling",
    price: 1000,
  },
  {
    key: "assembly",
    name: "Furniture Assembly",
    price: 1000,
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
   HAVERSINE DISTANCE
========================================================= */

function calculateStraightLineDistance(pointA, pointB) {
  if (!pointA || !pointB) {
    return 0;
  }

  const earthRadiusKm = 6371;

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(
    pointB.lat - pointA.lat
  );

  const longitudeDifference = toRadians(
    pointB.lng - pointA.lng
  );

  const latitudeA = toRadians(pointA.lat);
  const latitudeB = toRadians(pointB.lat);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

/* =========================================================
   ESTIMATED ROAD DISTANCE
========================================================= */

function calculateEstimatedRoadDistance(
  pickupArea,
  destinationArea
) {
  if (!pickupArea || !destinationArea) {
    return 0;
  }

  if (pickupArea === destinationArea) {
    return 2;
  }

  const pickupPoint =
    MOVING_AREAS[pickupArea];

  const destinationPoint =
    MOVING_AREAS[destinationArea];

  if (!pickupPoint || !destinationPoint) {
    return 0;
  }

  const straightLineDistance =
    calculateStraightLineDistance(
      pickupPoint,
      destinationPoint
    );

  const estimatedRoadDistance =
    straightLineDistance *
    ROAD_DISTANCE_FACTOR;

  return Number(
    Math.max(
      2,
      estimatedRoadDistance
    ).toFixed(1)
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function Booking() {
  const navigate = useNavigate();

  const {
    serviceId,
    categoryId,
  } = useParams();

  const numericServiceId =
    Number(serviceId);

  const numericCategoryId =
    Number(categoryId);

  const service = services?.find(
    (item) =>
      Number(item.id) ===
      numericServiceId
  );

  const config =
    CATEGORY_CONFIG[numericCategoryId];

  /* =======================================================
     MINIMUM DATE
  ======================================================= */

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [form, setForm] = useState({
    date: "",
    time: "",

    address: "",
    city: "",
    estate: "",
    houseNumber: "",

    notes: "",

    /* Cleaning */
    houseSize: "Bedsitter",
    cleaningLevel: "Standard Cleaning",
    frequency: "One-Time",
    cleaningExtras: [],

    officeSize: "Small",
    officeRooms: 1,
    officeCleaningLevel: "Standard Cleaning",
    officeFrequency: "One-Time",

    numberOfWindows: 1,
    windowHeight: "Ground Floor",
    windowSide: "Inside Only",

    numberOfCarpets: 1,
    carpetSize: "Small",
    carpetTreatment: "Standard Cleaning",

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
    pickupLocation: "",
    destinationLocation: "",

    pickupArea: "",
    destinationArea: "",

    propertyType: "Bedsitter",

    numberOfItems: 1,

    pickupFloor: "Ground Floor",
    destinationFloor: "Ground Floor",

    pickupHasLift: "No",
    destinationHasLift: "No",

    movingExtras: [],
  });

  /* =======================================================
     CHANGE HANDLER
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     CLEANING EXTRA TOGGLE
  ======================================================= */

  const toggleCleaningExtra = (
    extra
  ) => {
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
                item.name !==
                extra.name
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

  /* =======================================================
     MOVING EXTRA TOGGLE
  ======================================================= */

  const toggleMovingExtra = (
    extra
  ) => {
    setForm((previous) => {
      const exists =
        previous.movingExtras.includes(
          extra.key
        );

      if (exists) {
        return {
          ...previous,

          movingExtras:
            previous.movingExtras.filter(
              (key) =>
                key !== extra.key
            ),
        };
      }

      return {
        ...previous,

        movingExtras: [
          ...previous.movingExtras,
          extra.key,
        ],
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
    let distanceCharge = 0;
    let propertyCharge = 0;
    let itemCharge = 0;
    let floorCharge = 0;
    let movingExtrasCharge = 0;

    /* =====================================================
       HOUSE CLEANING
    ===================================================== */

    if (
      config?.type ===
      "houseCleaning"
    ) {
      const houseMultipliers = {
        Bedsitter: 1,
        "1 Bedroom": 1.33,
        "2 Bedroom": 2,
        "3 Bedroom": 2.67,
        "4 Bedroom": 3.67,
        "5+ Bedroom": 4.67,
      };

      const cleaningMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Move In / Move Out": 1.8,
        "Post Construction": 2,
        Fumigation: 2.5,
      };

      basePrice = Math.round(
        config.basePrice *
          (houseMultipliers[
            form.houseSize
          ] || 1) *
          (cleaningMultipliers[
            form.cleaningLevel
          ] || 1)
      );

      const discountRate =
        FREQUENCY_DISCOUNTS[
          form.frequency
        ] || 0;

      discount = Math.round(
        basePrice * discountRate
      );

      extrasTotal =
        form.cleaningExtras.reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0),
          0
        );
    }

    /* =====================================================
       OFFICE CLEANING
    ===================================================== */

    else if (
      config?.type ===
      "officeCleaning"
    ) {
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

      basePrice =
        officePrices[
          form.officeSize
        ] || 2500;

      basePrice = Math.round(
        basePrice *
          (levelMultipliers[
            form.officeCleaningLevel
          ] || 1)
      );

      basePrice +=
        Math.max(
          Number(form.officeRooms) - 3,
          0
        ) * 500;

      const discountRate =
        FREQUENCY_DISCOUNTS[
          form.officeFrequency
        ] || 0;

      discount = Math.round(
        basePrice * discountRate
      );
    }

    /* =====================================================
       WINDOW CLEANING
    ===================================================== */

    else if (
      config?.type ===
      "windowCleaning"
    ) {
      const windows =
        Number(
          form.numberOfWindows
        ) || 1;

      let pricePerWindow = 200;

      if (
        form.windowHeight ===
        "Upper Floor"
      ) {
        pricePerWindow += 100;
      }

      if (
        form.windowSide ===
        "Inside & Outside"
      ) {
        pricePerWindow += 100;
      }

      basePrice =
        windows *
        pricePerWindow;
    }

    /* =====================================================
       CARPET CLEANING
    ===================================================== */

    else if (
      config?.type ===
      "carpetCleaning"
    ) {
      const sizePrices = {
        Small: 1000,
        Medium: 1500,
        Large: 2200,
      };

      const treatmentMultipliers = {
        "Standard Cleaning": 1,
        "Deep Cleaning": 1.5,
        "Stain Removal": 1.8,
      };

      basePrice = Math.round(
        Number(
          form.numberOfCarpets
        ) *
          (sizePrices[
            form.carpetSize
          ] || 1000) *
          (treatmentMultipliers[
            form.carpetTreatment
          ] || 1)
      );
    }

    /* =====================================================
       SOFA CLEANING
    ===================================================== */

    else if (
      config?.type ===
      "sofaCleaning"
    ) {
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

      basePrice = Math.round(
        Number(
          form.sofaSeats
        ) *
          (materialPrices[
            form.sofaMaterial
          ] || 1200) *
          (treatmentMultipliers[
            form.sofaTreatment
          ] || 1)
      );
    }

    /* =====================================================
       LAUNDRY
    ===================================================== */

    else if (
      config?.type ===
        "washFold" ||
      config?.type ===
        "ironing" ||
      config?.type ===
        "dryCleaning"
    ) {
      const quantity =
        Number(
          form.laundryQuantity
        ) || 1;

      let price =
        config.basePrice;

      if (
        form.pickupDelivery ===
        "Pickup & Delivery"
      ) {
        price += 300;
      }

      basePrice =
        quantity * price;
    }

    /* =====================================================
       PLUMBING
    ===================================================== */

    else if (
      config?.type ===
        "leakRepair" ||
      config?.type ===
        "blockedDrain" ||
      config?.type ===
        "pipeInstallation"
    ) {
      const urgencyPrices = {
        Normal: 0,
        Urgent: 500,
        Emergency: 1000,
      };

      basePrice =
        config.basePrice +
        (urgencyPrices[
          form.plumbingUrgency
        ] || 0);
    }

    /* =====================================================
       ELECTRICAL
    ===================================================== */

    else if (
      config?.type ===
        "electricalRepair" ||
      config?.type ===
        "socketInstallation" ||
      config?.type ===
        "lightingInstallation"
    ) {
      const urgencyPrices = {
        Normal: 0,
        Urgent: 500,
        Emergency: 1000,
      };

      basePrice =
        config.basePrice +
        Math.max(
          Number(
            form.electricalPoints
          ) - 1,
          0
        ) *
          300;

      basePrice +=
        urgencyPrices[
          form.electricalUrgency
        ] || 0;
    }

    /* =====================================================
       GARDENING
    ===================================================== */

    else if (
      config?.type ===
        "lawnMaintenance" ||
      config?.type ===
        "gardenCleaning" ||
      config?.type ===
        "landscaping"
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

      basePrice = Math.round(
        config.basePrice *
          (gardenMultipliers[
            form.gardenSize
          ] || 1) *
          (frequencyMultipliers[
            form.gardeningFrequency
          ] || 1)
      );
    }

    /* =====================================================
       PAINTING
    ===================================================== */

    else if (
      config?.type ===
        "interiorPainting" ||
      config?.type ===
        "exteriorPainting" ||
      config?.type ===
        "roomPainting"
    ) {
      const wallCharges = {
        Good: 0,
        "Needs Preparation": 1000,
        "Damaged Walls": 2000,
      };

      const paintCharges = {
        "Customer Provides Paint": 0,
        "Ramon's Marketplace Provides Paint":
          2500,
      };

      basePrice =
        config.basePrice *
        Number(form.paintingRooms);

      basePrice +=
        wallCharges[
          form.wallCondition
        ] || 0;

      basePrice +=
        paintCharges[
          form.paintProvided
        ] || 0;
    }

    /* =====================================================
       MOVING — NO API
    ===================================================== */

    else if (
      config?.type ===
        "houseMoving" ||
      config?.type ===
        "officeMoving" ||
      config?.type ===
        "packingService"
    ) {
      const estimatedDistance =
        calculateEstimatedRoadDistance(
          form.pickupArea,
          form.destinationArea
        );

      basePrice =
        config.basePrice;

      distanceCharge = Math.round(
        estimatedDistance *
          MOVING_DISTANCE_RATE
      );

      propertyCharge =
        MOVING_PROPERTY_PRICES[
          form.propertyType
        ] || 0;

      const items =
        Math.max(
          Number(
            form.numberOfItems
          ) || 1,
          1
        );

      const extraItems =
        Math.max(
          items - 10,
          0
        );

      itemCharge =
        Math.ceil(
          extraItems / 5
        ) * 500;

      const floorPrices = {
        "Ground Floor": 0,
        "1st Floor": 300,
        "2nd Floor": 600,
        "3rd Floor": 900,
        "4th Floor": 1200,
        "5th Floor or Higher": 1500,
      };

      const pickupFloorCharge =
        floorPrices[
          form.pickupFloor
        ] || 0;

      const destinationFloorCharge =
        floorPrices[
          form.destinationFloor
        ] || 0;

      const pickupAccessCharge =
        form.pickupHasLift === "Yes"
          ? pickupFloorCharge * 0.5
          : pickupFloorCharge;

      const destinationAccessCharge =
        form.destinationHasLift ===
        "Yes"
          ? destinationFloorCharge * 0.5
          : destinationFloorCharge;

      floorCharge = Math.round(
        pickupAccessCharge +
          destinationAccessCharge
      );

      movingExtrasCharge =
        form.movingExtras.reduce(
          (total, key) => {
            const extra =
              MOVING_EXTRAS.find(
                (item) =>
                  item.key === key
              );

            return (
              total +
              (extra
                ? extra.price
                : 0)
            );
          },
          0
        );
    }

    const total = Math.max(
      0,
      Math.round(
        basePrice -
          discount +
          extrasTotal +
          distanceCharge +
          propertyCharge +
          itemCharge +
          floorCharge +
          movingExtrasCharge
      )
    );

    return {
      basePrice,
      discount,
      extrasTotal,
      distanceCharge,
      propertyCharge,
      itemCharge,
      floorCharge,
      movingExtrasCharge,
      total,
      estimatedDistance:
        config?.type === "houseMoving" ||
        config?.type === "officeMoving" ||
        config?.type === "packingService"
          ? calculateEstimatedRoadDistance(
              form.pickupArea,
              form.destinationArea
            )
          : 0,
    };
  }, [config, form]);

  /* =======================================================
     MOVING DETECTION
  ======================================================= */

  const isMoving =
    config?.type === "houseMoving" ||
    config?.type === "officeMoving" ||
    config?.type === "packingService";

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateBooking = () => {
    if (
      !serviceId ||
      Number.isNaN(numericServiceId)
    ) {
      alert(
        "The selected service is invalid."
      );
      return false;
    }

    if (
      !categoryId ||
      Number.isNaN(numericCategoryId)
    ) {
      alert(
        "The selected service category is invalid."
      );
      return false;
    }

    if (!config) {
      alert(
        "This service category could not be found."
      );
      return false;
    }

    if (!form.date) {
      alert(
        "Please select your preferred date."
      );
      return false;
    }

    if (!form.time) {
      alert(
        "Please select your preferred time."
      );
      return false;
    }

    if (isMoving) {
      if (!form.pickupLocation.trim()) {
        alert(
          "Please enter the pickup address."
        );
        return false;
      }

      if (!form.destinationLocation.trim()) {
        alert(
          "Please enter the destination address."
        );
        return false;
      }

      if (!form.pickupArea) {
        alert(
          "Please select the nearest pickup area."
        );
        return false;
      }

      if (!form.destinationArea) {
        alert(
          "Please select the nearest destination area."
        );
        return false;
      }

      if (
        !form.numberOfItems ||
        Number(form.numberOfItems) < 1
      ) {
        alert(
          "Please enter the number of items being moved."
        );
        return false;
      }

      if (
        priceSummary.estimatedDistance <= 0
      ) {
        alert(
          "Please select both moving areas so we can estimate the distance."
        );
        return false;
      }
    } else {
      if (!form.address.trim()) {
        alert(
          "Please enter your address."
        );
        return false;
      }

      if (!form.city.trim()) {
        alert(
          "Please enter your city."
        );
        return false;
      }

      if (!form.estate.trim()) {
        alert(
          "Please enter your estate/area."
        );
        return false;
      }
    }

    if (priceSummary.total <= 0) {
      alert(
        "The booking total must be greater than zero."
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const proceedToCheckout = () => {
    if (!validateBooking()) {
      return;
    }

    let bookingAddress = form.address;
    let bookingCity = form.city;
    let bookingEstate = form.estate;
    let bookingHouseNumber = form.houseNumber;

    if (isMoving) {
      bookingAddress =
        `Pickup: ${form.pickupLocation} | Destination: ${form.destinationLocation}`;

      bookingCity =
        form.city || "Nairobi";

      bookingEstate =
        `Pickup area: ${form.pickupArea} | Destination area: ${form.destinationArea}`;

      bookingHouseNumber =
        form.houseNumber || "";
    }

    const extras = [];

    if (!isMoving) {
      form.cleaningExtras.forEach(
        (extra) => {
          extras.push({
            name: extra.name,
            price: Number(
              extra.price
            ),
          });
        }
      );
    }

    if (isMoving) {
      extras.push({
        name: "Pickup Address",
        value: form.pickupLocation,
        price: 0,
      });

      extras.push({
        name: "Destination Address",
        value: form.destinationLocation,
        price: 0,
      });

      extras.push({
        name: "Pickup Area",
        value: form.pickupArea,
        price: 0,
      });

      extras.push({
        name: "Destination Area",
        value: form.destinationArea,
        price: 0,
      });

      extras.push({
        name: "Estimated Distance",
        value:
          `${priceSummary.estimatedDistance} km`,
        price:
          priceSummary.distanceCharge,
      });

      extras.push({
        name: "Property Type",
        value: form.propertyType,
        price:
          priceSummary.propertyCharge,
      });

      extras.push({
        name: "Number of Items",
        value: form.numberOfItems,
        price:
          priceSummary.itemCharge,
      });

      extras.push({
        name: "Pickup Floor",
        value: form.pickupFloor,
        price: 0,
      });

      extras.push({
        name: "Destination Floor",
        value: form.destinationFloor,
        price: 0,
      });

      extras.push({
        name: "Floor / Access Charge",
        price:
          priceSummary.floorCharge,
      });

      form.movingExtras.forEach(
        (key) => {
          const extra =
            MOVING_EXTRAS.find(
              (item) =>
                item.key === key
            );

          if (extra) {
            extras.push({
              name: extra.name,
              price: extra.price,
            });
          }
        }
      );
    }

    const bookingData = {
      serviceId:
        numericServiceId,

      categoryId:
        numericCategoryId,

      serviceName:
        service?.name ||
        service?.title ||
        config.service,

      categoryName:
        config.category,

      date: form.date,

      time: form.time,

      address: bookingAddress,

      city: bookingCity,

      estate: bookingEstate,

      houseNumber:
        bookingHouseNumber,

      houseSize:
        isMoving
          ? form.propertyType
          : form.houseSize,

      cleaningType:
        form.cleaningLevel,

      frequency:
        form.frequency,

      notes: form.notes,

      extras,

      total: Number(
        priceSummary.total
      ),

      ...(isMoving && {
        pickupLocation:
          form.pickupLocation,

        destinationLocation:
          form.destinationLocation,

        pickupArea:
          form.pickupArea,

        destinationArea:
          form.destinationArea,

        estimatedDistanceKm:
          priceSummary.estimatedDistance,

        distanceRate:
          MOVING_DISTANCE_RATE,

        baseMovingPrice:
          priceSummary.basePrice,

        distanceCharge:
          priceSummary.distanceCharge,

        propertyType:
          form.propertyType,

        numberOfItems:
          Number(form.numberOfItems),

        itemCharge:
          priceSummary.itemCharge,

        pickupFloor:
          form.pickupFloor,

        destinationFloor:
          form.destinationFloor,

        pickupHasLift:
          form.pickupHasLift,

        destinationHasLift:
          form.destinationHasLift,

        floorCharge:
          priceSummary.floorCharge,

        movingExtras:
          form.movingExtras,

        movingExtrasCharge:
          priceSummary.movingExtrasCharge,
      }),
    };

    console.log(
      "BOOKING DATA:",
      bookingData
    );

    navigate("/checkout", {
      state: {
        booking: bookingData,
        total: Number(
          priceSummary.total
        ),
      },
    });
  };

  /* =======================================================
     SERVICE NOT FOUND
  ======================================================= */

  if (!config) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-error">
            <h2>
              Service Not Found
            </h2>

            <p>
              The service category you
              selected could not be found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/services")
              }
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
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </button>

          <h1>
            Book {config.category}
          </h1>

          <p>
            Tell us what you need and
            choose your preferred date
            and time.
          </p>
        </div>

        {/* =================================================
            APPOINTMENT DETAILS
        ================================================= */}

        <section className="booking-section appointment-section">

          <div className="appointment-heading">
            <div className="appointment-icon">
              📅
            </div>

            <div>
              <h2>
                Appointment Details
              </h2>

              <p>
                Choose a convenient date
                and time for your service.
              </p>
            </div>
          </div>

          <div className="appointment-grid">

            {/* DATE */}

            <div className="appointment-card">

              <div className="appointment-card-icon">
                📅
              </div>

              <div className="appointment-card-content">

                <label htmlFor="booking-date">
                  Preferred Date
                  <span className="required-star">
                    *
                  </span>
                </label>

                <input
                  id="booking-date"
                  className="booking-date-input"
                  type="date"
                  name="date"
                  value={form.date}
                  min={today}
                  onChange={handleChange}
                  aria-label="Preferred booking date"
                />

                <small>
                  Select a date from today
                  onward.
                </small>

              </div>
            </div>

            {/* TIME */}

            <div className="appointment-card">

              <div className="appointment-card-icon">
                🕐
              </div>

              <div className="appointment-card-content">

                <label htmlFor="booking-time">
                  Preferred Time
                  <span className="required-star">
                    *
                  </span>
                </label>

                <select
                  id="booking-time"
                  className="booking-time-select"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  aria-label="Preferred booking time"
                >
                  <option value="">
                    Select a time slot
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

                <small>
                  Choose a two-hour service
                  window.
                </small>

              </div>
            </div>

          </div>

          {form.date && form.time && (
            <div className="appointment-confirmation">

              <span className="confirmation-icon">
                ✓
              </span>

              <div>
                <strong>
                  Appointment selected
                </strong>

                <p>
                  {form.date} ·{" "}
                  {form.time}
                </p>
              </div>

            </div>
          )}

        </section>

        {/* =================================================
            MOVING FORM
        ================================================= */}

        {isMoving && (
          <>
            <section className="booking-section">

              <h2>
                Moving Locations
              </h2>

              <p className="section-help">
                Enter the actual addresses
                below. Because this version
                does not use a mapping API,
                select the nearest known area
                so we can estimate the distance.
              </p>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Pickup Address *
                  </label>

                  <input
                    type="text"
                    name="pickupLocation"
                    value={
                      form.pickupLocation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. House 12, Riverside Drive, Westlands, Nairobi"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Destination Address *
                  </label>

                  <input
                    type="text"
                    name="destinationLocation"
                    value={
                      form.destinationLocation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. House 5, Ngong Road, Kilimani, Nairobi"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Nearest Pickup Area *
                  </label>

                  <select
                    name="pickupArea"
                    value={
                      form.pickupArea
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select pickup area
                    </option>

                    {Object.keys(
                      MOVING_AREAS
                    ).map(
                      (area) => (
                        <option
                          key={area}
                          value={area}
                        >
                          {area}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Nearest Destination Area *
                  </label>

                  <select
                    name="destinationArea"
                    value={
                      form.destinationArea
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select destination area
                    </option>

                    {Object.keys(
                      MOVING_AREAS
                    ).map(
                      (area) => (
                        <option
                          key={area}
                          value={area}
                        >
                          {area}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              {priceSummary.estimatedDistance >
                0 && (
                <div className="price-info">
                  Estimated moving distance:
                  <strong>
                    {" "}
                    {
                      priceSummary.estimatedDistance
                    }{" "}
                    km
                  </strong>

                  <small>
                    {" "}
                    (area-based estimate,
                    not live road routing)
                  </small>
                </div>
              )}

            </section>

            <section className="booking-section">

              <h2>
                Moving Details
              </h2>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Property Type *
                  </label>

                  <select
                    name="propertyType"
                    value={
                      form.propertyType
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {Object.keys(
                      MOVING_PROPERTY_PRICES
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

                <div className="form-group">
                  <label>
                    Number of Items *
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

                  <small>
                    First 10 items are
                    included. Additional
                    groups of 5 cost Ksh 500.
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Pickup Floor
                  </label>

                  <select
                    name="pickupFloor"
                    value={
                      form.pickupFloor
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option>
                      Ground Floor
                    </option>
                    <option>
                      1st Floor
                    </option>
                    <option>
                      2nd Floor
                    </option>
                    <option>
                      3rd Floor
                    </option>
                    <option>
                      4th Floor
                    </option>
                    <option>
                      5th Floor or Higher
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Pickup Has Lift?
                  </label>

                  <select
                    name="pickupHasLift"
                    value={
                      form.pickupHasLift
                    }
                    onChange={
                      handleChange
                    }
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
                  <label>
                    Destination Floor
                  </label>

                  <select
                    name="destinationFloor"
                    value={
                      form.destinationFloor
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option>
                      Ground Floor
                    </option>
                    <option>
                      1st Floor
                    </option>
                    <option>
                      2nd Floor
                    </option>
                    <option>
                      3rd Floor
                    </option>
                    <option>
                      4th Floor
                    </option>
                    <option>
                      5th Floor or Higher
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Destination Has Lift?
                  </label>

                  <select
                    name="destinationHasLift"
                    value={
                      form.destinationHasLift
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="No">
                      No
                    </option>

                    <option value="Yes">
                      Yes
                    </option>
                  </select>
                </div>

              </div>
            </section>

            <section className="booking-section">

              <h2>
                Moving Extras
              </h2>

              <div className="extras-grid">

                {MOVING_EXTRAS.map(
                  (extra) => (
                    <label
                      key={extra.key}
                      className="extra-option"
                    >
                      <input
                        type="checkbox"
                        checked={form.movingExtras.includes(
                          extra.key
                        )}
                        onChange={() =>
                          toggleMovingExtra(
                            extra
                          )
                        }
                      />

                      <span>
                        {extra.name}
                      </span>

                      <strong>
                        + Ksh{" "}
                        {extra.price.toLocaleString()}
                      </strong>
                    </label>
                  )
                )}

              </div>
            </section>
          </>
        )}

        {/* =================================================
            NON-MOVING LOCATION
        ================================================= */}

        {!isMoving && (
          <section className="booking-section">

            <h2>
              Service Location
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Address *
                </label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/building and street"
                />
              </div>

              <div className="form-group">
                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi"
                />
              </div>

              <div className="form-group">
                <label>
                  Estate / Area *
                </label>

                <input
                  type="text"
                  name="estate"
                  value={form.estate}
                  onChange={handleChange}
                  placeholder="e.g. Kilimani"
                />
              </div>

              <div className="form-group">
                <label>
                  House / Building Number
                </label>

                <input
                  type="text"
                  name="houseNumber"
                  value={
                    form.houseNumber
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            HOUSE CLEANING
        ================================================= */}

        {config.type ===
          "houseCleaning" && (
          <section className="booking-section">

            <h2>
              Cleaning Requirements
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  House Size
                </label>

                <select
                  name="houseSize"
                  value={
                    form.houseSize
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Bedsitter
                  </option>
                  <option>
                    1 Bedroom
                  </option>
                  <option>
                    2 Bedroom
                  </option>
                  <option>
                    3 Bedroom
                  </option>
                  <option>
                    4 Bedroom
                  </option>
                  <option>
                    5+ Bedroom
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Cleaning Level
                </label>

                <select
                  name="cleaningLevel"
                  value={
                    form.cleaningLevel
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Standard Cleaning
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
              </div>

              <div className="form-group">
                <label>
                  Frequency
                </label>

                <select
                  name="frequency"
                  value={
                    form.frequency
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
                    Monthly Subscription
                  </option>
                </select>
              </div>

            </div>

            <h3>
              Cleaning Extras
            </h3>

            <div className="extras-grid">

              {CLEANING_EXTRAS.map(
                (extra) => (
                  <label
                    key={extra.name}
                    className="extra-option"
                  >
                    <input
                      type="checkbox"
                      checked={form.cleaningExtras.some(
                        (item) =>
                          item.name ===
                          extra.name
                      )}
                      onChange={() =>
                        toggleCleaningExtra(
                          extra
                        )
                      }
                    />

                    <span>
                      {extra.name}
                    </span>

                    <strong>
                      + Ksh{" "}
                      {extra.price.toLocaleString()}
                    </strong>
                  </label>
                )
              )}

            </div>
          </section>
        )}

        {/* =================================================
            OFFICE CLEANING
        ================================================= */}

        {config.type ===
          "officeCleaning" && (
          <section className="booking-section">

            <h2>
              Office Cleaning
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Office Size
                </label>

                <select
                  name="officeSize"
                  value={
                    form.officeSize
                  }
                  onChange={
                    handleChange
                  }
                >
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
                  Number of Rooms
                </label>

                <input
                  type="number"
                  name="officeRooms"
                  min="1"
                  value={
                    form.officeRooms
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Cleaning Level
                </label>

                <select
                  name="officeCleaningLevel"
                  value={
                    form.officeCleaningLevel
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Standard Cleaning
                  </option>
                  <option>
                    Deep Cleaning
                  </option>
                  <option>
                    Post Construction
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Frequency
                </label>

                <select
                  name="officeFrequency"
                  value={
                    form.officeFrequency
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

        {config.type ===
          "windowCleaning" && (
          <section className="booking-section">

            <h2>
              Window Cleaning
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Number of Windows
                </label>

                <input
                  type="number"
                  name="numberOfWindows"
                  min="1"
                  value={
                    form.numberOfWindows
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Height
                </label>

                <select
                  name="windowHeight"
                  value={
                    form.windowHeight
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Ground Floor
                  </option>
                  <option>
                    Upper Floor
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Cleaning Side
                </label>

                <select
                  name="windowSide"
                  value={
                    form.windowSide
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Inside Only
                  </option>
                  <option>
                    Inside & Outside
                  </option>
                </select>
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            CARPET
        ================================================= */}

        {config.type ===
          "carpetCleaning" && (
          <section className="booking-section">

            <h2>
              Carpet Cleaning
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Number of Carpets
                </label>

                <input
                  type="number"
                  name="numberOfCarpets"
                  min="1"
                  value={
                    form.numberOfCarpets
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Carpet Size
                </label>

                <select
                  name="carpetSize"
                  value={
                    form.carpetSize
                  }
                  onChange={
                    handleChange
                  }
                >
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
                  Treatment
                </label>

                <select
                  name="carpetTreatment"
                  value={
                    form.carpetTreatment
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Standard Cleaning
                  </option>
                  <option>
                    Deep Cleaning
                  </option>
                  <option>
                    Stain Removal
                  </option>
                </select>
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            SOFA
        ================================================= */}

        {config.type ===
          "sofaCleaning" && (
          <section className="booking-section">

            <h2>
              Sofa Cleaning
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Number of Seats
                </label>

                <input
                  type="number"
                  name="sofaSeats"
                  min="1"
                  value={
                    form.sofaSeats
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Material
                </label>

                <select
                  name="sofaMaterial"
                  value={
                    form.sofaMaterial
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Fabric
                  </option>
                  <option>
                    Leather
                  </option>
                  <option>
                    Suede
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Treatment
                </label>

                <select
                  name="sofaTreatment"
                  value={
                    form.sofaTreatment
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Standard Cleaning
                  </option>
                  <option>
                    Deep Cleaning
                  </option>
                  <option>
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

            <h2>
              Laundry Details
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  name="laundryQuantity"
                  min="1"
                  value={
                    form.laundryQuantity
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Collection
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
                    Customer Drop-off
                  </option>
                  <option>
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

            <h2>
              Plumbing Details
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Urgency
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

              <div className="form-group">
                <label>
                  Affected Area
                </label>

                <input
                  type="text"
                  name="plumbingAreas"
                  value={
                    form.plumbingAreas
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. kitchen sink"
                />
              </div>

            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="plumbingDescription"
                value={
                  form.plumbingDescription
                }
                onChange={
                  handleChange
                }
              />
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

            <h2>
              Electrical Details
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Number of Points
                </label>

                <input
                  type="number"
                  name="electricalPoints"
                  min="1"
                  value={
                    form.electricalPoints
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
                  <option>
                    Emergency
                  </option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="electricalDescription"
                value={
                  form.electricalDescription
                }
                onChange={
                  handleChange
                }
              />
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

            <h2>
              Gardening Details
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Garden Size
                </label>

                <select
                  name="gardenSize"
                  value={
                    form.gardenSize
                  }
                  onChange={
                    handleChange
                  }
                >
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

            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="gardeningDescription"
                value={
                  form.gardeningDescription
                }
                onChange={
                  handleChange
                }
              />
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

            <h2>
              Painting Details
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Number of Rooms
                </label>

                <input
                  type="number"
                  name="paintingRooms"
                  min="1"
                  value={
                    form.paintingRooms
                  }
                  onChange={
                    handleChange
                  }
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
                  <option>
                    Good
                  </option>
                  <option>
                    Needs Preparation
                  </option>
                  <option>
                    Damaged Walls
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Paint
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
                    Customer Provides Paint
                  </option>

                  <option>
                    Ramon's Marketplace Provides Paint
                  </option>
                </select>
              </div>

            </div>

          </section>
        )}

        {/* =================================================
            ADDITIONAL NOTES
        ================================================= */}

        <section className="booking-section">

          <h2>
            Additional Information
          </h2>

          <div className="form-group">
            <label>
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Anything else the service provider should know?"
            />
          </div>

        </section>

        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        <section className="booking-summary">

          <h2>
            Price Summary
          </h2>

          <div className="price-row">
            <span>
              Base Price
            </span>

            <strong>
              Ksh{" "}
              {priceSummary.basePrice.toLocaleString()}
            </strong>
          </div>

          {priceSummary.discount >
            0 && (
            <div className="price-row">
              <span>
                Frequency Discount
              </span>

              <strong>
                - Ksh{" "}
                {priceSummary.discount.toLocaleString()}
              </strong>
            </div>
          )}

          {isMoving && (
            <>
              <div className="price-row">
                <span>
                  Estimated Distance
                  {priceSummary.estimatedDistance >
                    0 &&
                    ` (${priceSummary.estimatedDistance} km)`}
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.distanceCharge.toLocaleString()}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Property Size
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.propertyCharge.toLocaleString()}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Additional Items
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.itemCharge.toLocaleString()}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Floor / Access
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.floorCharge.toLocaleString()}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Moving Extras
                </span>

                <strong>
                  Ksh{" "}
                  {priceSummary.movingExtrasCharge.toLocaleString()}
                </strong>
              </div>
            </>
          )}

          {!isMoving &&
            priceSummary.extrasTotal >
              0 && (
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

          <div className="price-total">
            <span>
              Estimated Total
            </span>

            <strong>
              Ksh{" "}
              {priceSummary.total.toLocaleString()}
            </strong>
          </div>

          {isMoving && (
            <p className="price-disclaimer">
              Moving distance is an estimate
              based on the selected areas.
              Actual road distance may differ.
            </p>
          )}

          <button
            type="button"
            className="booking-submit-button"
            onClick={
              proceedToCheckout
            }
          >
            Continue — Ksh{" "}
            {priceSummary.total.toLocaleString()}
          </button>

        </section>

      </div>
    </div>
  );
}

export default Booking;