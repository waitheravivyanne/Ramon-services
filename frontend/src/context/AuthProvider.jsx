import { useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {

      return JSON.parse(savedUser);

    } catch {

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      return null;

    }

  });


  // =========================================
  // LOGIN
  // =========================================

  const login = (userData) => {

    const loggedInUser = {

      id: userData.id,

      name: userData.name,

      email: userData.email,

      role: userData.role

    };


    // Save JWT token

    localStorage.setItem(
      "token",
      userData.token
    );


    // Save user information

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );


    // Update React state immediately

    setUser(loggedInUser);


    console.log(
      "USER LOGGED IN:",
      loggedInUser
    );

  };


  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

  };


  return (

    <AuthContext.Provider
      value={{

        user,

        login,

        logout,

        isLoggedIn: !!user

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export default AuthProvider;