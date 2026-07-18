import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Categories from "./pages/Categories";
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

      <Navbar />

      <main className="app-container">

        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* All Services */}
          <Route path="/services" element={<Services />} />

          {/* Categories inside a service e.g. Cleaning */}
          <Route path="/services/:serviceId" element={<Categories />} />

          {/* Booking a specific category e.g. House Cleaning */}
          <Route path="/booking/:categoryId" element={<Booking />} />

          {/* Checkout */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Payment */}
          <Route path="/payment" element={<Payment />} />

          {/* Booking Success */}
          <Route path="/success" element={<Success />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

        </Routes>

      </main>

    </BrowserRouter>
  );
}

export default App;