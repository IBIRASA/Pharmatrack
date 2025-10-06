import heroImg from "../assets/landinguser.png"; 
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleSignUp = () => navigate("/register");
  const handleSignIn = () => navigate("/login");

  return (
  <section className="flex flex-col items-center justify-center text-center px-6 py-16 md:px-12 lg:flex-row lg:justify-between lg:text-left bg-gray-50 lg:px-70">
      <div className="flex flex-col items-center lg:items-start max-w-lg  mt-20 ">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
          Welcome to <span className="text-teal-600">PharmaTrack</span>
        </h1>
        <p className="mt-6 text-gray-600 max-w-md sm:max-w-lg">
          Connecting patients with nearby pharmacies for faster, easier care.
          Find trusted pharmacies in your area, check medicine availability, and save time on every visit.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button
            className="bg-green-900 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </div>

    
      <img
        src={heroImg}
        alt="Pharmacy"
        className="hidden lg:block w-96 rounded-2xl mt-13"
      />
    </section>
  );
};

export default Hero;
