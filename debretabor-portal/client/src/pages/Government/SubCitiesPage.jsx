import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchSubCities } from '../../api/publicApi';
import { PageShell, DataState, Prose, T } from '../../components/ui';

export default function SubCitiesPage() {
  const { lang, pick } = useLanguage();
  const state = useFetch(fetchSubCities, []);
  return (
    <PageShell eyebrow={T(lang, 'City Government', 'የከተማ አስተዳደር')} title={T(lang, 'Sub-Cities', 'ክፍለ ከተሞች')}>
      <DataState state={state}>
        {(items) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((sc) => (
              <article key={sc.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#003366]">{pick(sc, 'name')}</h2>
                <div className="mt-3"><Prose text={pick(sc, 'description')} /></div>
                {/* the schema stores the head-office address in Amharic only */}
                {sc.head_office_location_am && <p className="mt-3 text-sm text-gray-700">📍 {sc.head_office_location_am}</p>}
                {sc.contact_phone && <p className="mt-1 text-sm"><a className="text-[#004280] hover:underline" href={`tel:${sc.contact_phone}`}>📞 {sc.contact_phone}</a></p>}
              </article>
            ))}
          </div>
        )}
      </DataState>
    </PageShell>
  );
}
