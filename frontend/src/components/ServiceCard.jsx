import { Link } from "react-router-dom";
import "../styles/ServiceCard.css";

function ServiceCard({ service }) {

  return (

    <div className="service-card">

      <div className="service-icon">
        {service.icon || "🛠️"}
      </div>


      <h2>
        {service.name}
      </h2>


      <p>
        {service.description}
      </p>


      <p>
        📍 {service.location || "Nairobi"}
      </p>


      <p>
        {service.categories?.length || 0} services available
      </p>


      <Link
        to={`/services/${service.id}`}
      >

        <button className="service-button">
          View Services
        </button>

      </Link>

    </div>

  );

}

export default ServiceCard;