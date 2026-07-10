function ServiceCard({ service }) {

  return (
    <div className="service-card">

      <h2>{service.name}</h2>

      <p>
        {service.description}
      </p>

      <p>
        Price: {service.price}
      </p>

    </div>
  );

}


export default ServiceCard;