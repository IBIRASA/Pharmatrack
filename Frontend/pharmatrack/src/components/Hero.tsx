import heroImg from "../assets/landinguser.png"; 
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleSignUp = () => navigate("/register");
  const handleSignIn = () => navigate("/login");

  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-16 py-16">
      <div className="text-center lg:text-left lg:max-w-lg">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
          Welcome to <span className="text-teal-600">PharmaTrack</span>
        </h1>
        <p className="mt-8 text-gray-600 max-w-lg">
          Connecting patients with nearby pharmacies for faster, easier care.
          Find trusted pharmacies in your area, check medicine availability, and save time on every visit.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button
            className="bg-green-900 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </div>
      <img
        src={heroImg}
        alt="Pharmacy"
        className="w-96 mt-8 lg:mt-0 hidden lg:block rounded-2xl"
      />
    </section>
  );
};

export default Hero;
