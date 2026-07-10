import { useEffect, useState } from "react";
import api from "../api/axios";
import ServiceCard from "../components/ServiceCard";


function Services() {

  const [services, setServices] = useState([]);


  useEffect(() => {

    api.get("/services")
      .then(res => {

        setServices(res.data);

      })
      .catch(error => {

        console.log(error)

        console.log("Backend not connected, using sample services");

        setServices([
          {
            id: 1,
            name: "House Cleaning",
            description: "Professional home cleaning",
            price: 2000
          },
          {
            id: 2,
            name: "Laundry",
            description: "Wash and iron clothes",
            price: 1000
          }
        ]);

      });


  }, []);



  return (

    <div>

      <h1>
        Available Services
      </h1>


      {
        services.map(service => (

          <ServiceCard

            key={service.id}

            service={service}

          />

        ))
      }


    </div>

  );

}


export default Services;