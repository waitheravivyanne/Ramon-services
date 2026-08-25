import { useState } from "react";

function useAuth() {

  // =====================================================
  // GET SAVED USER WHEN APP STARTS
  // =====================================================

  const [user, setUser] = useState(() => {

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // No login information found
    if (!token || !savedUser) {
      return null;
    }

    try {

      const parsedUser = JSON.parse(savedUser);

      // Make sure the saved user contains the
      // information we need
      if (!parsedUser || !parsedUser.id) {
        return null;
      }

      return parsedUser;

    } catch (error) {

      console.error(
        "Could not read saved user:",
        error
      );

      // Remove corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }

  });


  // =====================================================
  // LOGIN
  // =====================================================

  const login = (userData) => {

    if (!userData || !userData.token) {

      console.error(
        "Login failed: no authentication token received."
      );

      return;
    }


    // ---------------------------------------------------
    // SAVE TOKEN
    // ---------------------------------------------------

    localStorage.setItem(
      "token",
      userData.token
    );


    // ---------------------------------------------------
    // CREATE USER OBJECT
    // ---------------------------------------------------

    const loggedInUser = {

      id: userData.id,

      name: userData.name,

      email: userData.email,

      role: userData.role

    };


    // ---------------------------------------------------
    // SAVE USER
    // ---------------------------------------------------

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );


    // ---------------------------------------------------
    // UPDATE REACT STATE
    // ---------------------------------------------------

    setUser(loggedInUser);


    console.log(
      "AUTH: User logged in:",
      loggedInUser
    );

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    // Remove authentication information

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    // Clear React authentication state

    setUser(null);


    console.log(
      "AUTH: User logged out."
    );

  };


  // =====================================================
  // RETURN AUTH DATA
  // =====================================================

  return {

    user,

    login,

    logout,

    // Convenient boolean you can use anywhere
    isLoggedIn: !!user

  };

}


export default useAuth;