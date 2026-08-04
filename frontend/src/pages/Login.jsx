import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import  useAuth  from "../hooks/useAuth";


function Login(){

  const navigate = useNavigate();

  const { login } = useAuth();


  const [form,setForm] = useState({
    email:"",
    password:""
  });


  const handleChange = (e)=>{

    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  };


  const submit = async(e)=>{

    e.preventDefault();


    try{

      const response = await api.post(
        "/login",
        form
      );


      login({

        token: response.data.token,

        name: response.data.name,

        role: response.data.role

      });


      alert("Login successful");


      navigate("/");


    }catch{

      alert(
        "Invalid email or password"
      );

    }

  };


  return(

    <form onSubmit={submit}>

      <h1>
        Login
      </h1>


      <input
        name="email"
        type="email"
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


      <button type="submit">
        Login
      </button>


    </form>

  );

}


export default Login;