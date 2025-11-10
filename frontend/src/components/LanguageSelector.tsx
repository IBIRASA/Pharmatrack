import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../i18n';
import type { Lang } from '../i18n';

const labels: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda'
};

export default function LanguageSelector() {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        aria-label={t('aria.change_language') || 'Change language'}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 text-gray-700 hover:text-green-600 p-2 rounded-md"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden md:inline text-sm">{labels[lang]}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
          {(['en', 'fr', 'rw'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${l === lang ? 'font-semibold' : ''}`}
            >
              {labels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
