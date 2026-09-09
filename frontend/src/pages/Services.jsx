import { useEffect, useState } from "react";
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

import api from "../api/axios";
import "../styles/Services.css";

function Services() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Choose an icon based on service name
  const getServiceIcon = (serviceName) => {

    switch (serviceName?.toLowerCase()) {

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


  // Get services from Flask backend
  useEffect(() => {

    const fetchServices = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get("/services");

        console.log("SERVICES FROM API:", response.data);

        setServices(response.data);

      } catch (err) {

        console.error("FAILED TO LOAD SERVICES:", err);

        setError(
          "Unable to load services. Please try again."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchServices();

  }, []);


  // Loading state
  if (loading) {

    return (

      <div className="services-container">

        <div className="services-header">

          <h1>Our Services</h1>

          <p className="services-subtitle">
            Loading available services...
          </p>

        </div>

      </div>

    );

  }


  // Error state
  if (error) {

    return (

      <div className="services-container">

        <div className="services-header">

          <h1>Our Services</h1>

          <p className="services-subtitle">
            {error}
          </p>

        </div>

      </div>

    );

  }


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


            {/* PRICE */}

            <p className="category-count">

              Starting from{" "}

              <strong>
                Ksh {Number(service.price || 0).toLocaleString()}
              </strong>

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
