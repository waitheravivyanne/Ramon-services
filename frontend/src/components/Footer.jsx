import { Link } from "react-router-dom";
import "../styles/Footer.css";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaClock
} from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Company */}
        <div className="footer-section">
          <h2>Ramon's Marketplace</h2>

          <p>
            Connecting customers with trusted professionals across Kenya.
            Find reliable cleaning, plumbing, electrical, gardening,
            painting, moving, repairs and many other services at affordable
            prices.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/services">Services</Link>
            </li>

            <li>
              <Link to="/register">Register</Link>
            </li>

            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact Us</h3>

          <p>
            <FaLocationDot className="footer-icon" />
            Nairobi, Kenya
          </p>

          <p>
            <FaPhone className="footer-icon" />
            +254 700 123 456
          </p>

          <p>
            <FaEnvelope className="footer-icon" />
            info@ramonsmarketplace.com
          </p>

          <p>
            <FaClock className="footer-icon" />
            Mon - Sat: 8:00 AM - 6:00 PM
          </p>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h3>Follow Us</h3>

          <div className="social-icons">

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
              <span>Facebook</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
              <span>Instagram</span>
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
              <span>X (Twitter)</span>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>

          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Ramon's Service Marketplace. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;