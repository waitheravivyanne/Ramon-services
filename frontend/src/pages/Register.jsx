import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


function Register(){

  const navigate = useNavigate();


  const [form,setForm]=useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });



  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  }



  function submit(e){

    e.preventDefault();


    api.post("/register",form)

    .then(res=>{

      alert(res.data.message);


      // Redirect to login page
      navigate("/login");


    })

    .catch(error=>{

      console.log(error);

      alert("Registration failed");

    });

  }



  return(

    <form onSubmit={submit}>


      <h1>
        Create Account
      </h1>


      <input
        name="name"
        placeholder="Full name"
        value={form.name}
        onChange={handleChange}
      />


      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />


      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />


      <select
        name="role"
        value={form.role}
        onChange={handleChange}
      >

        <option value="customer">
          Customer
        </option>


        <option value="provider">
          Service Provider
        </option>


      </select>


      <button type="submit">
        Register
      </button>


    </form>

  );

}


export default Register;