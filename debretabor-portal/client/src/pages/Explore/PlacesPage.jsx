import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchPlaces, asArray } from '../../api/publicApi';
import { PageShell, DataState, Picture, Prose, T } from '../../components/ui';

// category values are the places ENUM: Park | Monument | Museum
const CATEGORIES = {
  Park: ['Parks', 'መናፈሻዎች'],
  Monument: ['Monuments', 'ሐውልቶች'],
  Museum: ['Museums', 'ሙዚየሞች']
};

export default function PlacesPage({ category }) {
  const { lang, pick } = useLanguage();
  const state = useFetch(() => fetchPlaces(category), [category]);
  return (
    <PageShell eyebrow={T(lang, 'Explore Debre Tabor', 'ደብረ ታቦርን ይጎብኙ')} title={T(lang, ...CATEGORIES[category])}>
      <DataState state={state}>
        {(items) => (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((p) => {
              const images = asArray(p.images);
              return (
                <article key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <Picture src={images[0]} alt={pick(p, 'name')} className="h-56 w-full" />
                  {images.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto bg-gray-50 p-2">
                      {images.slice(1).map((src) => <Picture key={src} src={src} alt="" className="h-14 w-20 shrink-0 rounded" />)}
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-[#003366]">{pick(p, 'name')}</h2>
                    {pick(p, 'location') && <p className="mt-1 text-sm text-gray-500">📍 {pick(p, 'location')}</p>}
                    <div className="mt-3"><Prose text={pick(p, 'description')} /></div>
                    {p.google_maps_url && (
                      <a href={p.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-[#004280] hover:underline">
                        {T(lang, 'Open in Google Maps', 'በጉግል ካርታ ይመልከቱ')} →
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </DataState>
    </PageShell>
  );
}
