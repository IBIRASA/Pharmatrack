import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Phone, Mail, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useTheme } from '../context/ThemeContext';

function Footer() {
  try {
    const { t } = useTranslation();

    return (
      <footer id="footer" className="bg-(--text-dark) text-white py-12" data-name="footer" data-file="components/Footer.js" data-aos="zoom-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <a href="/#hero">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={logo}
                      alt="PharmFinder logo"
                      className="w-10 h-10 object-contain rounded-full" // same as header
                    />
                  </div>
                </a>
                <span className="text-2xl font-bold">PharmFinder</span>
              </div>
              <p className="text-gray-400">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.quick_links')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">{t('footer.how')}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>

            {/* <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div> */}

            <div id="contact">
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>+250784981935</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>info@pharmatrack.com</span>
                </li>
                <li>
                  <span>PharmTrack, Kigali City</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>{t('footer.copy')}</p>
            <div className="flex items-center justify-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}

function ThemeToggle() {
  try {
    const { t } = useTranslation();
    const { theme, toggle } = useTheme();
    const btnClass = theme === 'dark'
      ? 'inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-black hover:bg-gray-100'
      : 'inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700';
    return (
      <button
        onClick={toggle}
        className={btnClass}
        title={theme === 'dark' ? (t('settings.appearance.dark') || 'Dark') : (t('settings.appearance.light') || 'Light')}
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? <Moon className="w-4 h-4 text-black" /> : <Sun className="w-4 h-4" />} 
        <span className="text-sm">{theme === 'dark' ? (t('settings.appearance.dark') || 'Dark') : (t('settings.appearance.light') || 'Light')}</span>
      </button>
    );
  } catch (err) {
    return null;
  }
}

export default Footer;
