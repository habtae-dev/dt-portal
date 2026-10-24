// "Debre Tabor at a glance": area, population and other facts as cards, managed in the dashboard (City Facts).
// Shown on the home page directly above "Latest Updates". Renders nothing when no fact is published.
import { useLanguage } from '../context/LanguageContext';
import useFetch from '../hooks/useFetch';
import { fetchCityFacts } from '../api/publicApi';
import { T } from './ui';

export default function CityFacts() {
  const { lang, pick } = useLanguage();
  const { data } = useFetch(fetchCityFacts, []);
  if (!data || data.length === 0) return null;

  return (
    <section className="bg-gray-50 pt-14 px-4 sm:px-6 lg:px-8" aria-labelledby="glance-heading">
      <div className="max-w-6xl mx-auto">
        <span className="inline-block rounded bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
          {T(lang, 'City facts', 'የከተማ መረጃ')}
        </span>
        <h2 id="glance-heading" className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#003366]">
          {T(lang, 'Debre Tabor at a glance', 'ደብረ ታቦር በጨረፍታ')}
        </h2>
        <ul className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          {data.map((f) => (
            <li key={f.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0066cc] to-amber-400" aria-hidden="true" />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-2xl transition-colors group-hover:bg-blue-100" aria-hidden="true">
                  {f.icon || '📍'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{pick(f, 'label')}</p>
                  <p className="mt-1 break-words text-2xl font-extrabold leading-tight text-[#003366]">{pick(f, 'value')}</p>
                  {pick(f, 'note') && <p className="mt-1 text-xs text-gray-500">{pick(f, 'note')}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
