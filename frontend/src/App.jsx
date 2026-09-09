import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Booking from "./pages/Booking";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <>

      <Navbar />

      <main className="app-container">

        <Routes>

          {/* PUBLIC */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/services/:serviceId"
            element={<ServiceDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
          <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
          <Route
  path="/bookings"
  element={
    <ProtectedRoute>
      <Bookings />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

   


          {/* PROTECTED */}

   <Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

          <Route
            path="/booking/:serviceId/:categoryId"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            }
          />

          
        </Routes>

      </main>

      <Footer />

    </>
  );
}

export default App;