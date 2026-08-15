import { Link,  useParams } from "react-router-dom";
import services from "../data/services";
import "../styles/ServiceDetails.css";

function ServiceDetails() {

  const { serviceId } = useParams();


  const service = services.find(
    (item) => item.id === Number(serviceId)
  );


  if (!service) {

    return (

      <div className="service-error">

        <h2>
          Service not found
        </h2>

        <Link to="/services">
          ← Back to Services
        </Link>

      </div>

    );

  }


  return (

    <div className="service-details">


          {/* =========================================
          SERVICE HEADER
      ========================================= */}

      <div className="service-header">

        <div className="service-main-icon">
          {service.icon}
        </div>

        <h1>
          {service.name}
        </h1>

        <p>
          {service.description}
        </p>

      </div>


      {/* =========================================
          CATEGORIES
      ========================================= */}

      <div className="category-list">

        {service.categories.map((category) => (

          <div
            className="category-card"
            key={category.id}
          >

            <div className="category-icon">
              ✨
            </div>

            <h2>
              {category.name}
            </h2>

            <p>
              Starting from
              <strong>
                {" "}Ksh {category.price}
              </strong>
            </p>


            <Link
              to={`/booking/${service.id}/${category.id}`}
              className="book-button"
            >
              Book This Service →
            </Link>

          </div>

        ))}

      </div>

    </div>

  );

}

export default ServiceDetails;