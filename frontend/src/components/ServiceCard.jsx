import { Link } from "react-router-dom";
import "./ServiceCard.css";

function ServiceCard({ service }) {
  return (
    <div className="service-card">

      <h2>{service.name}</h2>

      <p>{service.description}</p>

      <Link to={`/services/${service.id}`}>
        <button className="service-btn">
          View Services
        </button>
      </Link>

    </div>
  );
}

export default ServiceCard;