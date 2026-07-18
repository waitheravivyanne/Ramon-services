import { useEffect, useState } from "react";
import api from "../api/axios";
import ServiceCard from "../components/ServiceCard";
import sampleServices from "../data/services";
import "./Services.css";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/services")
      .then((res) => {
        setServices(res.data);
      })
      .catch((error) => {
        console.log(error);
        console.log("Using local sample services...");
        setServices(sampleServices);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="services-container">
        <h2>Loading services...</h2>
      </div>
    );
  }

  return (
    <div className="services-container">

      <h1>Available Services</h1>

      <p className="services-subtitle">
        Choose a service category to get started.
      </p>

      <div className="service-list">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
          />
        ))}
      </div>

    </div>
  );
}

export default Services;