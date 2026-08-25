import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const total = location.state?.total ?? booking?.total ?? 0;

  // --------------------------------------------------
  // NO BOOKING
  // --------------------------------------------------

  if (!booking) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>No booking found.</h2>

          <p>
            Please select a service and complete your booking
            before proceeding to checkout.
          </p>

          <button onClick={() => navigate("/services")}>
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CLEANING EXTRAS
  // --------------------------------------------------

  const extras =
    booking.extras ||
    booking.cleaningExtras ||
    [];

  // --------------------------------------------------
  // SERVICE NAME
  // --------------------------------------------------

  const serviceName =
    booking.serviceName ||
    "Service";

  // --------------------------------------------------
  // CATEGORY
  // --------------------------------------------------

  const categoryName =
    booking.categoryName ||
    "";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="checkout-container">

      <div className="checkout-card">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="checkout-header">

          <h1>
            Checkout
          </h1>

          <p>
            Review your booking details before
            continuing to payment.
          </p>

        </div>


        {/* =========================================
            SERVICE
        ========================================= */}

        <div className="checkout-section">

          <h3>
            Service
          </h3>

          <div className="checkout-service">

            <strong>
              {serviceName}
            </strong>

            {categoryName && (
              <span>
                {categoryName}
              </span>
            )}

          </div>

        </div>


        {/* =========================================
            SERVICE DETAILS
        ========================================= */}

        <div className="checkout-section">

          <h3>
            Booking Details
          </h3>


          {/* CLEANING */}

          {serviceName === "Cleaning" && (
            <>
              {booking.houseSize && (
                <p>
                  <strong>
                    House Size:
                  </strong>{" "}
                  {booking.houseSize}
                </p>
              )}

              {booking.cleaningType && (
                <p>
                  <strong>
                    Cleaning Type:
                  </strong>{" "}
                  {booking.cleaningType}
                </p>
              )}

              {booking.frequency && (
                <p>
                  <strong>
                    Frequency:
                  </strong>{" "}
                  {booking.frequency}
                </p>
              )}
            </>
          )}


          {/* LAUNDRY */}

          {serviceName === "Laundry" && (
            <>
              {booking.laundryType && (
                <p>
                  <strong>
                    Laundry Type:
                  </strong>{" "}
                  {booking.laundryType}
                </p>
              )}

              {booking.laundryQuantity && (
                <p>
                  <strong>
                    Quantity:
                  </strong>{" "}
                  {booking.laundryQuantity}
                </p>
              )}

              {booking.pickupDelivery && (
                <p>
                  <strong>
                    Pickup / Delivery:
                  </strong>{" "}
                  {booking.pickupDelivery}
                </p>
              )}
            </>
          )}


          {/* PLUMBING */}

          {serviceName === "Plumbing" && (
            <>
              {booking.plumbingIssue && (
                <p>
                  <strong>
                    Plumbing Issue:
                  </strong>{" "}
                  {booking.plumbingIssue}
                </p>
              )}

              {booking.plumbingUrgency && (
                <p>
                  <strong>
                    Urgency:
                  </strong>{" "}
                  {booking.plumbingUrgency}
                </p>
              )}
            </>
          )}


          {/* ELECTRICAL */}

          {serviceName === "Electrical" && (
            <>
              {booking.electricalIssue && (
                <p>
                  <strong>
                    Electrical Issue:
                  </strong>{" "}
                  {booking.electricalIssue}
                </p>
              )}

              {booking.numberOfRooms && (
                <p>
                  <strong>
                    Number of Rooms:
                  </strong>{" "}
                  {booking.numberOfRooms}
                </p>
              )}

              {booking.electricalUrgency && (
                <p>
                  <strong>
                    Urgency:
                  </strong>{" "}
                  {booking.electricalUrgency}
                </p>
              )}
            </>
          )}


          {/* GARDENING */}

          {serviceName === "Gardening" && (
            <>
              {booking.gardeningService && (
                <p>
                  <strong>
                    Gardening Service:
                  </strong>{" "}
                  {booking.gardeningService}
                </p>
              )}

              {booking.gardenSize && (
                <p>
                  <strong>
                    Garden Size:
                  </strong>{" "}
                  {booking.gardenSize}
                </p>
              )}

              {booking.gardeningFrequency && (
                <p>
                  <strong>
                    Frequency:
                  </strong>{" "}
                  {booking.gardeningFrequency}
                </p>
              )}
            </>
          )}


          {/* PAINTING */}

          {serviceName === "Painting" && (
            <>
              {booking.paintingType && (
                <p>
                  <strong>
                    Painting Type:
                  </strong>{" "}
                  {booking.paintingType}
                </p>
              )}

              {booking.numberOfRoomsPainting && (
                <p>
                  <strong>
                    Number of Rooms:
                  </strong>{" "}
                  {booking.numberOfRoomsPainting}
                </p>
              )}

              {booking.wallCondition && (
                <p>
                  <strong>
                    Wall Condition:
                  </strong>{" "}
                  {booking.wallCondition}
                </p>
              )}

              {booking.paintProvided && (
                <p>
                  <strong>
                    Paint Provided:
                  </strong>{" "}
                  {booking.paintProvided}
                </p>
              )}
            </>
          )}


          {/* MOVING */}

          {serviceName === "Moving" && (
            <>
              {booking.movingType && (
                <p>
                  <strong>
                    Moving Type:
                  </strong>{" "}
                  {booking.movingType}
                </p>
              )}

              {booking.movingDistance && (
                <p>
                  <strong>
                    Distance:
                  </strong>{" "}
                  {booking.movingDistance} KM
                </p>
              )}

              {booking.numberOfItems && (
                <p>
                  <strong>
                    Number of Items:
                  </strong>{" "}
                  {booking.numberOfItems}
                </p>
              )}

              {booking.packingRequired && (
                <p>
                  <strong>
                    Packing Required:
                  </strong>{" "}
                  {booking.packingRequired}
                </p>
              )}
            </>
          )}

        </div>


        {/* =========================================
            DATE & TIME
        ========================================= */}

        <div className="checkout-section">

          <h3>
            Date & Time
          </h3>

          <p>
            <strong>
              Date:
            </strong>{" "}
            {booking.date}
          </p>

          <p>
            <strong>
              Time:
            </strong>{" "}
            {booking.time}
          </p>

        </div>


        {/* =========================================
            LOCATION
        ========================================= */}

        <div className="checkout-section">

          <h3>
            Service Location
          </h3>

          <p>
            <strong>
              Address:
            </strong>{" "}
            {booking.address}
          </p>

          <p>
            <strong>
              City:
            </strong>{" "}
            {booking.city}
          </p>

          {booking.estate && (
            <p>
              <strong>
                Estate:
              </strong>{" "}
              {booking.estate}
            </p>
          )}

          {booking.houseNumber && (
            <p>
              <strong>
                House / Apartment:
              </strong>{" "}
              {booking.houseNumber}
            </p>
          )}

        </div>


        {/* =========================================
            EXTRAS
        ========================================= */}

        {serviceName === "Cleaning" && (
          <div className="checkout-section">

            <h3>
              Extra Services
            </h3>


            {extras.length > 0 ? (

              extras.map((extra) => (

                <p key={extra.name}>

                  {extra.name}

                  {" - "}

                  Ksh{" "}
                  {Number(
                    extra.price || 0
                  ).toLocaleString()}

                </p>

              ))

            ) : (

              <p>
                No extras selected.
              </p>

            )}

          </div>
        )}


        {/* =========================================
            NOTES
        ========================================= */}

        {booking.notes && (

          <div className="checkout-section">

            <h3>
              Special Instructions
            </h3>

            <p>
              {booking.notes}
            </p>

          </div>

        )}


        {/* =========================================
            PRICE
        ========================================= */}

        <div className="checkout-total">

          <span>
            Total
          </span>

          <strong>
            Ksh{" "}
            {Number(total).toLocaleString()}
          </strong>

        </div>


        {/* =========================================
            PAYMENT
        ========================================= */}

        <button
  className="checkout-button"
  onClick={() =>
    navigate("/payment", {
      state: {
        booking,
        total,
      },
    })
  }
>
  Continue to Payment →
</button>


        {/* BACK */}

        <button
          className="checkout-back"
          onClick={() => navigate(-1)}
        >
          ← Back to Booking
        </button>

      </div>

    </div>
  );
}

export default Checkout;