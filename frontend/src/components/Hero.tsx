import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import landingimage from '../assets/user.jpg';
import { useTranslation } from '../i18n';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section id="hero" className="bg-linear-to-br bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-32 items-center">
          {/*  Left Content */}
          <div data-aos="fade-down" data-aos-duration="1000">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-2xl text-gray-600 mb-4 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex gap-4">
              <Link 
                to="/register" 
                className="bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-lg"
              >
                {t('nav.register')}
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-green-600 px-10 py-4 rounded-lg border-2 border-green-600 hover:bg-green-50 font-semibold shadow-md hover:shadow-lg transition-all text-lg"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[700px]" data-aos="zoom-in" data-aos-duration="1000">
            <img
              src={landingimage}
              alt="Pharmacy"
              className="rounded-2xl shadow-2xl w-md h-md object-cover"
            />
            <div className="absolute -bottom-6 -left-15 bg-white p-2 rounded-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}