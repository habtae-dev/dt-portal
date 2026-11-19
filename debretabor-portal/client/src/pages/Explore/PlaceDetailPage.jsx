import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 🌟 1. useParams አስመጣ
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchPlaceById, asArray } from '../../api/publicApi';
import { PageShell, DataState, Picture, Prose, T } from '../../components/ui';

const CATEGORIES = {
  Park: ['Parks', 'መናፈሻዎች'],
  Monument: ['Monuments', 'ሐውልቶች'],
  Museum: ['Museums', 'ሙዚየሞች']
};

export default function PlaceDetailPage({ category: propCategory }) {
  const { lang, pick } = useLanguage();
  const { id } = useParams(); // 🌟 2. ከ URL ላይ id ን በቀጥታ እንቀበላለን
  const [activeImage, setActiveImage] = useState(null);

  // 3. አሁን id በትክክል ወደ fetchPlaceById ይገባል (undefined አይሆንም)
  const state = useFetch(() => (id ? fetchPlaceById(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    setActiveImage(null);
  }, [id]);

  const normalizedCategory = propCategory
    ? propCategory.charAt(0).toUpperCase() + propCategory.slice(1).replace(/s$/, '')
    : 'Park';

  const catInfo = CATEGORIES[normalizedCategory] || ['Explore', 'መዳረሻዎች'];

  return (
    <PageShell
      eyebrow={T(lang, 'Explore Debre Tabor', 'ደብረ ታቦርን ይጎብኙ')}
      title={T(lang, ...catInfo)}
    >
      <DataState state={state}>
        {(item) => {
          if (!item) return null;
          const images = asArray(item.images);
          const currentImg = activeImage || images[0];
          const itemCategory = item.category || normalizedCategory;
          const listPath = `/explore/${itemCategory.toLowerCase()}`;

          return (
            <div className="space-y-6">
              {/* Back Button */}
              <a
                href={listPath}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', listPath);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#004280] hover:underline"
              >
                ← {T(lang, `Back to ${CATEGORIES[itemCategory]?.[0] || 'Places'}`, `ወደ ${CATEGORIES[itemCategory]?.[1] || 'መዳረሻዎች'} ተመለስ`)}
              </a>

              <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#004280]">
                    {T(lang, ...(CATEGORIES[itemCategory] || [itemCategory, itemCategory]))}
                  </span>
                  {pick(item, 'location') && (
                    <span className="text-sm text-gray-500">📍 {pick(item, 'location')}</span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-[#003366] sm:text-3xl">
                  {pick(item, 'name')}
                </h1>

                {images.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="h-72 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[420px]">
                      <Picture src={currentImg} alt={pick(item, 'name')} className="h-full w-full object-cover" />
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((src) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => setActiveImage(src)}
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                              currentImg === src ? 'border-[#003366] opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Picture src={src} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 border-t border-gray-100 pt-6">
                  <Prose text={pick(item, 'description')} />
                </div>

                {item.google_maps_url && (
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <a
                      href={item.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#004280] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003366]"
                    >
                      📍 {T(lang, 'Open in Google Maps', 'በጉግል ካርታ ይመልከቱ')} →
                    </a>
                  </div>
                )}
              </article>
            </div>
          );
        }}
      </DataState>
    </PageShell>
  );
}