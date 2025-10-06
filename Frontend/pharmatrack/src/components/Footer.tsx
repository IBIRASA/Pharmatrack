import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-teal-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold">PharmaTrack</h3>
            <p className="mt-2 text-sm">
              Connecting patients with nearby pharmacies for faster, easier care.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-2">Contact</h4>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <FaPhoneAlt className="text-green-400" /> +250 788 123 456
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-green-400" /> pharmatrack@gmail.com
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <FaMapMarkerAlt className="text-green-400" /> Kigali, Rwanda
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <FaMapMarkerAlt className="text-green-400" /> Open 24/7
            </p>
          </div>
        </div>
        <p className="text-center text-sm mt-12 opacity-70">
          © 2025 PharmaTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
