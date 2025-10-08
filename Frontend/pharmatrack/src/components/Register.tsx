import { useState, ChangeEvent, FormEvent } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          confirmPassword: formData.confirmPassword.trim(),
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || data);
        return;
      }

      alert("Account created successfully!");
      setFormData({
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "patient",
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ detail: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center mb-6">
          <img src={logo} alt="PharmaTrack" className="mx-auto mb-2 w-50 h-40" />
          <h2 className="text-2xl font-semibold text-green-800">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullname"
            placeholder="Full name"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.fullname}
            aria-describedby="fullname-error"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            pattern="[a-zA-Z0-9@.+-_]+"
            title="Only letters, numbers, and @/./+/-/_ are allowed"
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.username}
            aria-describedby="username-error"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirmPassword-error"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            aria-invalid={!!errors.role}
            aria-describedby="role-error"
          >
            <option value="">Select role</option>
            <option value="patient">Patient</option>
            <option value="pharmacist">Pharmacist</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-800 text-white py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

          {Object.keys(errors).length > 0 && (
            <div className="mt-3 text-red-600 text-sm">
              {errors.detail ? (
                <p>{errors.detail}</p>
              ) : errors.non_field_errors ? (
                <p>{(errors.non_field_errors as string[])[0]}</p>
              ) : (
                Object.keys(errors).map((key) => (
                  <p key={key} id={`${key}-error`}>
                    {String(errors[key])}
                  </p>
                ))
              )}
            </div>
          )}
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
