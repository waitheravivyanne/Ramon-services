import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ children }) {

  const { user } = useAuth();

  console.log("PROTECTED ROUTE USER:", user);

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

  console.log(
    "User IS logged in. Allowing protected page."
  );

  return children;

}

export default ProtectedRoute;


