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

        {/* =========================
            COMPANY
        ========================== */}

        <div className="footer-section">

          <h2>Ramon's Marketplace</h2>

          <p>
            Connecting customers with trusted professionals across Kenya.
            Find reliable cleaning, plumbing, electrical, gardening,
            painting, moving, repairs and many other services at affordable
            prices.
          </p>

        </div>


        {/* =========================
            QUICK LINKS
        ========================== */}

        <div className="footer-section">

          <h3>Quick Links</h3>

          <ul>

            <li>
              <Link to="/">
                Home
              </Link>
            </li>

            <li>
              <Link to="/services">
                Services
              </Link>
            </li>

            <li>
              <Link to="/register">
                Register
              </Link>
            </li>

            <li>
              <Link to="/login">
                Login
              </Link>
            </li>

          </ul>

        </div>


        {/* =========================
            CONTACT
        ========================== */}

        <div className="footer-section">

          <h3>Contact Us</h3>

          <p>
            <FaLocationDot className="footer-icon" />
            Nairobi, Kenya
          </p>

          <p>
            <FaPhone className="footer-icon" />
            +254 182 122 616
          </p>

          

          <p>
            <FaEnvelope className="footer-icon" />
            254lusha@gmail.com
          </p>

          <p>
            <FaClock className="footer-icon" />
            Mon - Sat: 8:00 AM - 6:00 PM
          </p>

        </div>


        {/* =========================
            SOCIAL MEDIA
        ========================== */}

        <div className="footer-section">

          <h3>Follow Us</h3>

          <div className="social-icons">

            {/* Facebook */}

            <a
              href="https://facebook.com"
              className="facebook"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >

              <FaFacebook />

              <span>
                Facebook
              </span>

            </a>


            {/* Instagram */}

            <a
              href="https://instagram.com"
              className="instagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
                       

              <FaInstagram />

              <span>
                Instagram
              </span>

            </a>


            {/* X / Twitter */}

            <a
              href="https://x.com"
              className="twitter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
            >

              <FaXTwitter />

              <span>
                X (Twitter)
              </span>

            </a>


            {/* LinkedIn */}

            <a
              href="https://linkedin.com"
              className="linkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >

              <FaLinkedin />

              <span>
                LinkedIn
              </span>

            </a>

          </div>

        </div>

      </div>


      {/* =========================
          FOOTER BOTTOM
      ========================== */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Ramon's Service Marketplace.
          All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;