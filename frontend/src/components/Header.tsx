import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../i18n';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50" data-aos="fade-down" data-aos-duration="1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-xl">
              <img src={logo} alt={t('alt.logo') || 'PharmaFinder logo'} className="w-30 h-40 object-contain rounded-full" />
            </div>
            <span className="text-xl font-bold text-gray-900">PharmaFinder</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-md text-gray-700"
            aria-label={t('aria.toggle_menu') || 'Toggle menu'}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <nav className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              {t('nav.home')}
            </Link>
            <a
              href="#about"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              {t('nav.about')}
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              {t('nav.features')}
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              {t('nav.contact')}
            </a>

            <Link
              to="/login"
              className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
            >
              {t('nav.register')}
            </Link>
          </nav>
        </div>
        {/* Mobile dropdown menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col items-start gap-2 mt-2 pb-4">
            <Link
              to="/"
              className="block w-full text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <a
              href="#about"
              className="block w-full text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.about')}
            </a>
            <a
              href="#how-it-works"
              className="block w-full text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.features')}
            </a>
            <a
              href="#contact"
              className="block w-full text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.contact')}
            </a>

            <div className="w-full px-4 py-2">
              <LanguageSelector />
            </div>

            <Link
              to="/login"
              className="block w-full text-gray-700 hover:text-green-600 font-medium px-4 py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
