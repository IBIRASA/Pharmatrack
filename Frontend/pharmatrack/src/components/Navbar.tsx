import { useState} from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center py-8 px-8 lg:px-70 bg-white shadow z-50 ">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-teal-600 font-bold text-2xl">Pharma</span>
        <span className="text-black font-semibold text-2xl">Track</span>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex gap-6 text-gray-700">
        <li><a href="#" className="hover:text-teal-600">Home</a></li>
        <li><a href="#" className="hover:text-teal-600">About Us</a></li>
        <li><a href="#" className="hover:text-teal-600">Why Us</a></li>
        <li><a href="#" className="hover:text-teal-600">Contact</a></li>
      </ul>

      {/* Hamburger Icon (Mobile) */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md lg:hidden">
          <ul className="flex flex-col items-center gap-4 py-6 text-gray-700">
            <li><a href="#" className="hover:text-teal-600">Home</a></li>
            <li><a href="#" className="hover:text-teal-600">About Us</a></li>
            <li><a href="#" className="hover:text-teal-600">Why Us</a></li>
            <li><a href="#" className="hover:text-teal-600">Contact</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
