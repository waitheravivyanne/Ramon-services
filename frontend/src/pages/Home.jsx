import { Link } from "react-router-dom";

function Home() {

  return (

    <div>

      <h1>
        Welcome to Ramon's Service Marketplace
      </h1>

      <p>
        Find trusted service providers near you.
      </p>

      <Link to="/services">
        <button>
          View Services
        </button>
      </Link>

      <Link to="/register">
        <button>
          Register
        </button>
      </Link>

      <Link to="/login">
        <button>
          Login
        </button>
      </Link>

    </div>

  );

}

export default Home;