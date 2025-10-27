import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50"   data-aos="fade-down"          
      data-aos-duration="1000" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className=" w-10 h-10  flex items-center justify-center font-bold text-xl">
                <img
                  src={logo}
                  alt="PharmFinder logo"
                  className="w-30 h-40 object-contain rounded-full "
                />
            </div>
            <span className="text-xl font-bold text-gray-900">PharmaFinder</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
            >
              Register
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
