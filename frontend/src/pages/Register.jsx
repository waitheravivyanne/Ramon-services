import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function submit(e) {
    e.preventDefault();

    api
      .post("/register", form)
      .then((res) => {
        alert(res.data.message);

        // Go to login page
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);

        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Registration failed.");
        }
      });
  }

  return (
    <div className="register-container">

      <form onSubmit={submit} className="register-form">

        <h1>Create Account</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>

        <button type="submit">
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;