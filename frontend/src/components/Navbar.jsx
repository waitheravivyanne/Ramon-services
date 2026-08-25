// import { Link, useNavigate } from "react-router-dom";
// import "../styles/Navbar.css";

// function Navbar() {
//   const navigate = useNavigate();

//   const handleBack = () => {
//     navigate(-1);
//   };

//   return (
//     <nav className="navbar">

//       {/* BACK BUTTON */}
//       <button
//         className="back-button"
//         onClick={handleBack}
//         title="Go back"
//       >
//         ←
//         <span>Back</span>
//       </button>

//       {/* LOGO */}
//       <Link to="/" className="logo">
//         Ramon's Marketplace
//       </Link>

//       {/* NAVIGATION LINKS */}
//       <div className="nav-links">

//         <Link to="/">
//           Home
//         </Link>

//         <Link to="/services">
//           Services
//         </Link>

//         <Link to="/login">
//           Login
//         </Link>

//         <Link to="/register">
//           Register
//         </Link>

//       </div>

//     </nav>
//   );
// }

// export default Navbar;


import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {

  const { user, logout } = useAuth();

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
      >
        Ramon's Marketplace
      </Link>

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/services">
          Services
        </Link>

        {user ? (

          <>

            <span className="welcome-user">
              Welcome, {user.name}
            </span>

            {user.role === "admin" && (
              <Link to="/admin">
                Admin Dashboard
              </Link>
            )}

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </>

        ) : (

          <>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

          </>

        )}

      </div>

    </nav>
  );
}

export default Navbar;