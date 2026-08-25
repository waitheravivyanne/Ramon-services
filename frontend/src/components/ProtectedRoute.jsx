import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({
  children,
  adminOnly = false
}) {

  const { user } = useAuth();

  console.log(
    "PROTECTED ROUTE USER:",
    user
  );


  // =========================================
  // NOT LOGGED IN
  // =========================================

  if (!user) {

    console.log(
      "User is NOT logged in. Redirecting to login."
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  // =========================================
  // ADMIN-ONLY PAGE
  // =========================================

  if (
    adminOnly &&
    user.role !== "admin"
  ) {

    console.log(
      "User is NOT an admin. Access denied."
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  // =========================================
  // ALLOW ACCESS
  // =========================================

  console.log(
    "User is authorized. Allowing protected page."
  );

  return children;

}

export default ProtectedRoute;