import bgImage from "../assets/bgImage.png";
import { Link } from "react-router-dom";
function Search() {

  return (
    <section
      className="relative py-24 bg-cover bg-center" data-aos="zoom-in"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 text-center text-white">
        <p className="bg-yellow-200 text-green-800 px-4 py-2 rounded-md inline-block mb-4">
          Your Personal medicine tracker at a glance
        </p>
        <h2 className="text-3xl font-bold">Search a medicine?</h2>
        <p className="mt-2 max-w-2xl mx-auto">
          With PharmaTrack, patients and pharmacies manage everything in one place.
          Patients can search medicines, check nearby availability, and get directions easily.
        </p>
        <Link to="/login" className="mt-6 inline-block bg-green-900 px-6 py-3 rounded-lg hover:bg-green-700">
          Search Medicine
        </Link>
      </div>
    </section>
  );
};

export default Search