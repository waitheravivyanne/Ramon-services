import { Link } from "react-router-dom";
// import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        Ramon's Marketplace
      </Link>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/services">Services</Link>

        <Link to="/login">Login</Link>

        <Link to="/register">Register</Link>

      </div>

    </nav>
  );
}

export default Navbar;