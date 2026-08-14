// import { Link } from "react-router-dom";
// import services from "../data/services";
// import "../styles/Services.css";

// function Services() {

//   return (

//     <div className="services-container">

//       <div className="services-header">

//         <h1>Our Services</h1>

//         <p className="services-subtitle">
//           Find trusted professionals for the services you need.
//         </p>

//       </div>


//       <div className="service-list">

//         {services.map((service) => (

//           <div
//             className="service-card"
//             key={service.id}
//           >

//             <div className="service-icon">

//               {service.icon}

//             </div>


//             <h2>
//               {service.name}
//             </h2>


//             <p>
//               {service.description}
//             </p>


//             <p className="category-count">

//               {service.categories.length} services available

//             </p>


//             <Link
//               to={`/services/${service.id}`}
//               className="service-btn"
//             >

//               View Services

//             </Link>

//           </div>

//         ))}

//       </div>

//     </div>

//   );

// }

// export default Services;

import { Link } from "react-router-dom";
import {
  FaBroom,
  FaTshirt,
  FaWrench,
  FaBolt,
  FaLeaf,
  FaPaintRoller,
  FaTruckMoving,
  FaTools
} from "react-icons/fa";

import services from "../data/services";
import "../styles/Services.css";

function Services() {

  // Choose a professional icon based on service name
  const getServiceIcon = (serviceName) => {

    switch (serviceName.toLowerCase()) {

      case "cleaning":
        return <FaBroom />;

      case "laundry":
        return <FaTshirt />;

      case "plumbing":
        return <FaWrench />;

      case "electrical":
        return <FaBolt />;

      case "gardening":
        return <FaLeaf />;

      case "painting":
        return <FaPaintRoller />;

      case "moving":
        return <FaTruckMoving />;

      default:
        return <FaTools />;
    }
  };


  return (

    <div className="services-container">

      {/* HEADER */}

      <div className="services-header">

        <h1>
          Our Services
        </h1>

        <p className="services-subtitle">
          Find trusted professionals for the services you need.
        </p>

      </div>


      {/* SERVICES */}

      <div className="service-list">

        {services.map((service) => (

          <div
            className="service-card"
            key={service.id}
          >

            {/* ICON */}

            <div className="service-icon">

              {getServiceIcon(service.name)}

            </div>


            {/* SERVICE NAME */}

            <h2>
              {service.name}
            </h2>


            {/* DESCRIPTION */}

            <p className="service-description">

              {service.description}

            </p>


            {/* NUMBER OF SERVICES */}

            <p className="category-count">

              <strong>
                {service.categories?.length || 0}
              </strong>

              {" "}

              {service.categories?.length === 1
                ? "service available"
                : "services available"}

            </p>


            {/* BUTTON */}

            <Link
              to={`/services/${service.id}`}
              className="service-btn"
            >

              Explore Service

              <span className="arrow">
                →
              </span>

            </Link>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Services;