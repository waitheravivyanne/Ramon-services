import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">

      <div className="hero">

        <h1>
          Find Trusted Service Providers Near You
        </h1>

        <p>
          Connect with verified professionals for cleaning, plumbing,
          electrical work, painting, gardening, repairs, moving services,
          and much more—all in one place.
        </p>

        <div className="hero-buttons">

          <Link to="/services">
            <button className="primary-btn">
              Explore Services
            </button>
          </Link>

          <Link to="/register">
            <button className="secondary-btn">
              Register
            </button>
          </Link>

          <Link to="/login">
            <button className="secondary-btn">
              Login
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Home;