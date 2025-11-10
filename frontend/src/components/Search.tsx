import bgImage from "../assets/bjImage.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from '../i18n';

function Search() {
  const { t } = useTranslation();

  return (
    <section
      className="relative py-24 bg-cover bg-center" data-aos="zoom-in"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 text-center text-white">
        <p className="bg-yellow-200 text-green-800 px-4 py-2 rounded-md inline-block mb-4">
          {t('search.promo')}
        </p>
        <h2 className="text-3xl font-bold">{t('search.title')}</h2>
        <p className="mt-2 max-w-2xl mx-auto">
          {t('search.desc')}
        </p>
        <Link to="/login" className="mt-6 inline-block bg-green-900 px-6 py-3 rounded-lg hover:bg-green-700">
          {t('search.cta')}
        </Link>
      </div>
    </section>
  );
};

export default Search