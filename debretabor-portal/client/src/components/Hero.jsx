// components/Hero.jsx - home-page opening: slideshow, mayor's message, quick links.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useFetch from '../hooks/useFetch';
import { fetchExecutive } from '../api/publicApi';
import { Picture, T } from './ui';

import monument from '../assets/hero-monument.jpg';
import aerial from '../assets/hero-aerial.webp';
import street from '../assets/hero-street.jpg';

const SLIDES = [
  {
    image: monument,
    badge_en: 'Official Debre Tabor City Portal', badge_am: 'ኦፊሴላዊ የደብረ ታቦር ከተማ ፖርታል',
    title_en: 'Welcome to the Historical, Green and Mountainous City of Debre Tabor',
    title_am: 'እንኳን ወደ ታሪካዊቷ፣ አረንጓዴዋ እና ተራራማዋ የደብረ ታቦር ከተማ በደህና መጡ',
    description_en: 'Find public services, city information and tourism destinations in one place.',
    description_am: 'የመንግሥት አገልግሎቶችን፣ የከተማ መረጃዎችን እና የቱሪዝም መዳረሻዎችን በአንድ ቦታ ያግኙ።',
    primaryLink: '/services/online', secondaryLink: '/about/administration'
  },
  {
    image: aerial,
    badge_en: 'Digital Citizen Services', badge_am: 'ዲጂታል የዜጎች አገልግሎት',
    title_en: 'File and Track Your Complaints Online',
    title_am: 'ቅሬታዎን በኦንላይን ያቅርቡ፣ ሂደቱንም ይከታተሉ',
    description_en: 'Submit a complaint to the right office and follow its status with your tracking code.',
    description_am: 'ቅሬታዎን ለሚመለከተው ጽህፈት ቤት ያቅርቡ፤ በመከታተያ ኮድዎ ሂደቱን ይመልከቱ።',
    primaryLink: '/services/online', secondaryLink: '/announcements/notices'
  },
  {
    image: street,
    badge_en: 'Investment & Development', badge_am: 'የኢንቨስትመንት እና የልማት ማዕከል',
    title_en: 'Explore Development and Business Opportunities',
    title_am: 'የልማት እና የንግድ እድሎችን ያስሱ',
    description_en: 'Read the investment guide, licensing steps and current city projects.',
    description_am: 'የኢንቨስትመንት መመሪያ፣ የንግድ ፈቃድ አሰጣጥ እና ወቅታዊ የከተማ ፕሮጀክቶችን ያንብቡ።',
    primaryLink: '/explore/business', secondaryLink: '/projects/projects'
  }
];

const QUICK_LINKS = [
  { to: '/about/geography', icon: '🗺️', en: 'Geography & Topography', am: 'ጂኦግራፊ እና ከፍታ', descEn: 'Highland climate, location and landscape.', descAm: 'ከተማዋ የምትገኝበት ከፍታ፣ አየር ንብረት እና መልክዓ-ምድር።' },
  { to: '/about/administration', icon: '🏛️', en: 'City Administration', am: 'የከተማ አስተዳደር', descEn: "Mayor's office, sectoral bodies and structure.", descAm: 'የከንቲባ ጽህፈት ቤት፣ የዘርፍ መስሪያ ቤቶች እና መዋቅር።' },
  { to: '/about/history', icon: '📜', en: 'History & Heritage', am: 'ታሪክ እና ቅርስ', descEn: 'The roots, heritage and traditions of Debre Tabor.', descAm: 'የደብረ ታቦር ታሪካዊ አመጣጥ፣ ቅርስ እና ባህላዊ እሴቶች።' }
];

function MayorMessage() {
  const { lang, pick } = useLanguage();
  const { data } = useFetch(() => fetchExecutive('mayor'), []);
  const mayor = data?.[0];
  if (!mayor) return null; // nothing published in the dashboard yet -> no placeholder person is shown

  const excerpt = (pick(mayor, 'content') || '').trim();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{T(lang, "Mayor's Message", 'የከንቲባው መልዕክት')}</h2>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{pick(mayor, 'title')}</p>
          {excerpt && <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-5 whitespace-pre-line">{excerpt}</p>}
          <Link to="/gov/mayors" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
            {T(lang, 'Read More', 'ተጨማሪ ያንብቡ')} &rarr;
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-200">
          <Picture src={mayor.image_url} alt={pick(mayor, 'person_name')} className="w-36 h-36 rounded-full border-4 border-blue-600 shadow-md mb-4" />
          <h3 className="font-bold text-gray-900 text-lg text-center">{pick(mayor, 'person_name') || pick(mayor, 'title')}</h3>
          {pick(mayor, 'position') && <p className="text-xs text-gray-500 text-center">{pick(mayor, 'position')}</p>}
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const { lang, pick } = useLanguage();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const active = SLIDES[slide];

  return (
    <div className="text-gray-800">
      <section className="relative w-full min-h-[70vh] text-white overflow-hidden flex flex-col bg-gray-900" aria-roledescription="carousel">
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${s.image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center flex-grow justify-center">
          <div key={`b${slide}`} className="inline-flex items-center gap-2 bg-black/50 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pick(active, 'badge')}
          </div>
          <h1 key={`t${slide}`} className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mb-5 drop-shadow-lg animate-fadeIn">
            {pick(active, 'title')}
          </h1>
          <p key={`d${slide}`} className="text-base sm:text-lg text-gray-100 max-w-2xl mb-8 leading-relaxed drop-shadow animate-fadeIn">
            {pick(active, 'description')}
          </p>
          <div key={`c${slide}`} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6 animate-fadeIn">
            <Link to={active.primaryLink} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-8 py-3 rounded-lg shadow-xl transition-colors text-center">
              {T(lang, 'Explore Services', 'አገልግሎቶችን ያስሱ')} &rarr;
            </Link>
            <Link to={active.secondaryLink} className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md font-semibold px-8 py-3 rounded-lg transition-colors text-center">
              {T(lang, 'Learn More', 'ተጨማሪ ይወቁ')}
            </Link>
          </div>
          <div className="flex justify-center items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slide}
                className={`h-2 rounded-full transition-all duration-500 ${i === slide ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="h-12" />

      <MayorMessage />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_LINKS.map((q) => (
            <Link key={q.to} to={q.to} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-xl mb-4 group-hover:bg-blue-100 transition-colors" aria-hidden="true">{q.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{T(lang, q.en, q.am)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{T(lang, q.descEn, q.descAm)}</p>
              </div>
              <div className="mt-6 text-sm font-semibold text-blue-600 group-hover:underline">{T(lang, 'Learn More', 'ተጨማሪ ይመልከቱ')} &rarr;</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
