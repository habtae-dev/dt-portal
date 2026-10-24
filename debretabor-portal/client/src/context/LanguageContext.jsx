// context/LanguageContext.jsx
// EN/AM toggle for the public site. Content objects throughout the app
// store both `*_en` and `*_am` fields; components read the active one
// via `pick(item, 'title')` rather than branching everywhere.

import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

const STRINGS = {
  en: {
    home: 'Home', about: 'About Debre Tabor', administration: 'Administration',
    services: 'Services', resources: 'Resources', media: 'Media',
    loadMore: 'Load more',
    fileComplaint: 'File a Complaint', trackComplaint: 'Track a Complaint',
    heroTitle: 'Debre Tabor City Administration',
    heroSubtitle: 'Serving the highlands community with transparency and accountability.',
    latestNews: 'Latest News', announcements: 'Announcements', adminLogin: 'Admin Login',
    tenders: 'Tenders', vacancies: 'Vacancies', notices: 'Public Notices', businessLicensing: 'Business Licensing'
  },
  am: {
    home: 'መነሻ', about: 'ስለ ደብረ ታቦር', administration: 'አስተዳደር',
    services: 'አገልግሎቶች', resources: 'ግብዓቶች', media: 'ሚዲያ',
    loadMore: 'ተጨማሪ ይመልከቱ',
    fileComplaint: 'ቅሬታ ያስገቡ', trackComplaint: 'ቅሬታ ይከታተሉ',
    heroTitle: 'የደብረ ታቦር ከተማ አስተዳደር',
    heroSubtitle: 'ለደጋማ አካባቢ ማህበረሰብ በግልጽነት እና በተጠያቂነት እናገለግላለን።',
    latestNews: 'የቅርብ ጊዜ ዜናዎች', announcements: 'ማስታወቂያዎች', adminLogin: 'የአስተዳዳሪ መግቢያ',
    tenders: 'ጨረታዎች', vacancies: 'የሥራ ክፍት ቦታዎች', notices: 'የማስታወቂያ ሰሌዳ', businessLicensing: 'የንግድ ፈቃድ'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('dt_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('dt_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'en' ? 'am' : 'en'));

  // Given an object with `${field}_en` / `${field}_am` keys, returns the
  // value for the active language.
  const pick = (obj, field) => {
    const own = obj?.[`${field}_${lang}`];
    return own !== undefined && own !== null && own !== '' ? own : (obj?.[`${field}_en`] ?? '');
  };

  const t = (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, pick, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
