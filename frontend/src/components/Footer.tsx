import logo from '../assets/logo.png';
import { Phone, Mail } from 'lucide-react';

function Footer() {
  try {
    return (
  <footer id="footer" className="bg-(--text-dark) text-white py-12" data-name="footer" data-file="components/Footer.js" data-aos="zoom-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="PharmFinder logo"
                    className="w-30 h-40 object-contain rounded-full"
                  />
                </div>
                <span className="text-2xl font-bold">PharmFinder</span>
              </div>
              <p className="text-gray-400">
                Making healthcare accessible by connecting patients with pharmacies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div id="contact">
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>+0000000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>info@pharmfinder.com</span>
                </li>
                <li>
                  <span>Pharmafinder, Kigali City</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PharmFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}

export default Footer;
