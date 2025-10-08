import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import logo from "../assets/logo.png";
import API from "../api";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
interface LoginForm {
  username: string;
  password: string;
}
interface Errors {
  [key: string]: string | string[];
}
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({ username: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const res = await API.post("/login/", formData);
      alert(res.data.message);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response && err.response.data) setErrors(err.response.data);
      else alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img src={logo} alt="PharmaTrack" className="mx-auto mb-2 w-50 h-40" />
          <h2 className="text-2xl font-semibold text-green-800">Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
      <input
  type="text"
  name="username"
  placeholder="Username"
  value={formData.username}
  onChange={handleChange}
  className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
  required
/>


          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            Submit
          </button>
            {Object.keys(errors).map((key) => (
        <p key={key} style={{ color: "red" }}>{errors[key]}</p>
      ))}
        </form>

        <p className="text-center text-sm mt-4">
          Create a new account?{" "}
           <Link to="/register" className="text-pink-600 hover:underline">
          Register
        </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
