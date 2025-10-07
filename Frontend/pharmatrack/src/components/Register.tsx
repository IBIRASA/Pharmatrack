import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../api"

interface RegisterForm {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "patient" | "pharmacist";
}

interface Errors {
  [key: string]: string | string[];
}
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const res = await API.post("/register", formData);
      alert(res.data.message);
      navigate("/login");
    } catch (err: any) {
      if (err.response && err.response.data) setErrors(err.response.data);
      else alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center mb-6">
          <img src={logo} alt="PharmaTrack" className="mx-auto mb-2 w-50 h-40" />
          <h2 className="text-2xl font-semibold text-green-800">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullname"
            placeholder="Fullnames"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
 <input
            type="text"
            name="username"
            placeholder="username"
            onChange={handleChange}
              pattern="[a-zA-Z0-9@.+-_]+"
  title="Only letters, numbers, and @/./+/-/_ are allowed"
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select role</option>
            <option value="patient">Patient</option>
            <option value="pharmacist">Pharmacist</option>
          </select>

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
          Already have an account?{" "}
                <Link to="/login" className="text-pink-600 hover:underline">
          Login
        </Link>

        </p>
      </div>
    </div>
  );
};

export default Register;
