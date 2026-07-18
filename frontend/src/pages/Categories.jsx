import { useParams } from "react-router-dom";
import { useState } from "react";

function CleaningServices() {
  const { id } = useParams();
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      name: "Cleaning",
      description: "Professional home and office cleaning.",
      price: 1500,
      items: [
        {
          name: "House Cleaning",
          options: {
            houseSizes: [
              "Bedsitter",
              "1 Bedroom",
              "2 Bedroom",
              "3 Bedroom",
              "4 Bedroom",
              "5+ Bedroom"
            ],
            cleaningType: [
              "Standard Cleaning",
              "Deep Cleaning",
              "Move In/Move Out",
              "Post Construction",
              "Fumigation"
            ],
            frequency: [
              "One-Time",
              "Weekly",
              "Bi-Weekly",
              "Monthly Subscription"
            ]
          }
        },
        {
          name: "Office Cleaning"
        },
        {
          name: "Window Cleaning"
        },
        {
          name: "Carpet Cleaning"
        },
        {
          name: "Sofa Cleaning"
        }
      ]
    }
  ];

  const service = services.find((s) => s.id === Number(id));

  if (!service) return <h2>Service not found</h2>;

  return (
    <div className="category-page">
      <h1>{service.name}</h1>

      {service.items.map((item, index) => (
        <div key={index} className="service-item">

          <button
            onClick={() =>
              setSelectedService(
                selectedService === item.name ? null : item.name
              )
            }
          >
            {item.name}
          </button>

          {selectedService === item.name && item.options && (
            <div className="options">

              <h3>Choose House Size</h3>
              <select>
                {item.options.houseSizes.map((size, i) => (
                  <option key={i}>{size}</option>
                ))}
              </select>

              <h3>Cleaning Type</h3>
              <select>
                {item.options.cleaningType.map((type, i) => (
                  <option key={i}>{type}</option>
                ))}
              </select>

              <h3>Cleaning Frequency</h3>
              <select>
                {item.options.frequency.map((freq, i) => (
                  <option key={i}>{freq}</option>
                ))}
              </select>

              <br /><br />

              <button>Continue Booking</button>

            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default CleaningServices;