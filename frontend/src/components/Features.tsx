
import { Search, MapPin, Package, Bell, ShieldCheck, Clock } from 'lucide-react';
function Features() {
  try {
    const features = [
      {
        icon: <Search className="w-6 h-6 text-[--primary-color]" />,
        title: 'Medicine Search',
        description: 'Search for any medicine and find pharmacies that have it in stock instantly'
      },
      {
        icon: <MapPin className="w-6 h-6 text-[--primary-color]" />,
        title: 'Locate Nearby Pharmacies',
        description: 'Use your current location to find the nearest pharmacies on an interactive map'
      },
      {
        icon: <Package className="w-6 h-6 text-[--primary-color]" />,
        title: 'Inventory Management',
        description: 'Pharmacies can manage their inventory with automated low-stock notifications'
      },
      {
        icon: <Bell className="w-6 h-6 text-[--primary-color]" />,
        title: 'Smart Notifications',
        description: 'Get alerts when medicine stock is running low or when new stock arrives'
      },
      {
        icon: <ShieldCheck className="w-6 h-6 text-[--primary-color]" />,
        title: 'Secure & Private',
        description: 'Your data is protected with enterprise-grade security and encryption'
      },
      {
        icon: <Clock className="w-6 h-6 text-[--primary-color]" />,
        title: 'Real-time Updates',
        description: 'Access up-to-date information on medicine availability and pharmacy hours'
      }
    ];

    return (
      <section className="py-20 bg-white" data-name="features" data-file="components/Features.js">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-(--text-dark) mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-(--text-light)">
              Powerful features for patients and pharmacies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="zoom-in">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
                <h3 className="text-xl font-semibold text-(--text-dark) mb-2">
                  {feature.title}
                </h3>
                <p className="text-(--text-light)">
                  {feature.description}
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