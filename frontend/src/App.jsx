import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Booking from "./pages/Booking";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      {/* Navigation */}
      <Navbar />

      <main className="app-container">

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Services */}
          <Route
            path="/services"
            element={<Services />}
          />

          {/* Service Details */}
          <Route
            path="/services/:serviceId"
            element={<ServiceDetails />}
          />

          {/* Booking (Protected) */}
         <Route
  path="/booking/:serviceId/:categoryId"
  element={
    <ProtectedRoute>
      <Booking />
    </ProtectedRoute>
  }
/>

          {/* Checkout (Protected) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Payment (Protected) */}
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Success */}
          <Route
            path="/success"
            element={<Success />}
          />

          {/* Login */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Register */}
          <Route
            path="/register"
            element={<Register />}
          />

        </Routes>

      </main>

      {/* Footer */}
      <Footer />

    </BrowserRouter>
  );
}

export default App;