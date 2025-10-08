import { useState, ChangeEvent, FormEvent } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

interface LoginForm {
  username: string;
  password: string;
}

interface Errors {
  [key: string]: string | string[];
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || { detail: data.message || "Login failed" });
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ detail: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img src={logo} alt="PharmaTrack" className="mx-auto mb-2 w-50 h-40" />
          <h2 className="text-2xl font-semibold text-green-800">Login</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              aria-invalid={!!errors.username}
              aria-describedby="username-error"
            />
          </div>

          <div>
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-800 text-white py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Login"}
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
          Don’t have an account?{" "}
          <Link to="/register" className="text-pink-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
