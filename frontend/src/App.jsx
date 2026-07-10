import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";


function App() {

  return (

    <BrowserRouter>

      <div>

        <h1>
          Service Marketplace
        </h1>

        <p>
          Find trusted service providers
        </p>


        <Routes>

          <Route
            path="/"
            element={<Home />}
          />


          <Route
            path="/services"
            element={<Services />}
          />


          <Route
            path="/register"
            element={<Register />}
          />


          <Route
            path="/login"
            element={<Login />}
          />

        </Routes>

      </div>

    </BrowserRouter>

  );

}


export default App;