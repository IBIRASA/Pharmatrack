import { useTranslation } from '../i18n';
import { MapPin, Search, Package } from 'lucide-react';

export default function About() {
  try {
    const { t } = useTranslation();
    const aboutItems = [
      { icon: <MapPin className="w-6 h-6 text-[--primary-color]" />, key: 1 },
      { icon: <Search className="w-6 h-6 text-[--primary-color]" />, key: 2 },
      { icon: <Package className="w-6 h-6 text-[--primary-color]" />, key: 3 },
    ];

    return (
      <section id="about" className="py-20 bg-gray-50" data-name="about" data-file="components/About.js">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-(--text-dark) mb-4">
              {t('about.title')}
            </h2>
            <p className="text-xl text-(--text-light)">
              {t('about.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="zoom-in">
            {aboutItems.map((item) => (
              <div key={item.key} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-(--text-dark) mb-2">
                  {t(`about.${item.key}.title`)}
                </h3>
                <p className="text-(--text-light)">
                  {t(`about.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('About component error:', error);
    return null;
  }
}
