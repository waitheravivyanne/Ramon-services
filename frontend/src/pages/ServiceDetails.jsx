import { useParams, Link } from "react-router-dom";
import services from "../data/services";
import "../styles/ServiceDetails.css";

function ServiceDetails() {
  const { serviceId } = useParams();

  const service = services.find(
    (item) => item.id === Number(serviceId)
  );

  if (!service) {
    return (
      <div className="service-details">
        <h2>Service not found.</h2>
      </div>
    );
  }

  return (
    <div className="service-details">

      <h1>{service.name}</h1>

      <p className="service-description">
        {service.description}
      </p>

      <h2>Available Services</h2>

      <div className="categories-grid">

        {service.categories?.map((category) => (

          <div
            key={category.id}
            className="category-card"
          >

            <h3>{category.name}</h3>

            <p>
              Starting From
            </p>

            <h2>
              Ksh {category.price}
            </h2>

            <Link
              to={`/booking/${service.id}/${category.id}`}
            >
              <button>
                Book Now
              </button>
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ServiceDetails;