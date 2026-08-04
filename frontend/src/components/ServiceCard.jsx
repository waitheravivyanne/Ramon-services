import { Link } from "react-router-dom";
import "../styles/ServiceCard.css";

function ServiceCard({ service }) {
  console.log(service);
  return (
    <div className="service-card">

      <h2>{service.name}</h2>

      <p>{service.description}</p>

       <p className="price">
        {/* Starting from Ksh {service.categories[0].price} */}
          Starting from Ksh {service.price}

      </p>

      <Link to={`/services/${service.id}`}>
        <button className="service-btn">
          View Details
        </button>
      </Link>

    </div>
  );
}

export default ServiceCard;