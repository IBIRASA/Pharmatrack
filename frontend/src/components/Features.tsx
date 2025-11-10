
import { Search, MapPin, Package, Bell, ShieldCheck, Clock } from 'lucide-react';
import { useTranslation } from '../i18n';

function Features() {
  try {
    const { t } = useTranslation();
    const features = [
      { icon: <Search className="w-6 h-6 text-[--primary-color]" />, key: 1 },
      { icon: <MapPin className="w-6 h-6 text-[--primary-color]" />, key: 2 },
      { icon: <Package className="w-6 h-6 text-[--primary-color]" />, key: 3 },
      { icon: <Bell className="w-6 h-6 text-[--primary-color]" />, key: 4 },
      { icon: <ShieldCheck className="w-6 h-6 text-[--primary-color]" />, key: 5 },
      { icon: <Clock className="w-6 h-6 text-[--primary-color]" />, key: 6 },
    ];

    return (
      <section id="how-it-works" className="py-20 bg-white" data-name="features" data-file="components/Features.js">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-(--text-dark) mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-(--text-light)">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="zoom-in">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
                <h3 className="text-xl font-semibold text-(--text-dark) mb-2">
                  {t(`feature.${feature.key}.title`)}
                </h3>
                <p className="text-(--text-light)">
                  {t(`feature.${feature.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Features component error:', error);
    return null;
  }
}

export default Features