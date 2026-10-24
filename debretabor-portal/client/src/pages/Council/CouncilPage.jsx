import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchCouncil } from '../../api/publicApi';
import { PageShell, DataState, Picture, DocumentLink, Prose, T } from '../../components/ui';

// subcategory values are the council_contents ENUM: overview | structure | speaker | standing_committees
const SECTIONS = {
  overview: ['Council Overview', 'የምክር ቤት አጠቃላይ መግለጫ'],
  structure: ['Administrative Structure', 'የአስተዳደር መዋቅር'],
  speaker: ['Speaker', 'አፈ ጉባኤ'],
  standing_committees: ['Standing Committees', 'ቋሚ ኮሚቴዎች']
};

export default function CouncilPage({ subcategory }) {
  const { lang, pick } = useLanguage();
  const state = useFetch(() => fetchCouncil(subcategory), [subcategory]);
  return (
    <PageShell eyebrow={T(lang, 'City Council', 'የከተማ ምክር ቤት')} title={T(lang, ...SECTIONS[subcategory])}>
      <DataState state={state}>
        {(items) => (
          <div className="space-y-6">
            {items.map((it) => (
              <article key={it.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:flex">
                {it.image_url && <Picture src={it.image_url} alt={pick(it, 'title')} className="h-56 w-full sm:h-auto sm:w-64 shrink-0" />}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#003366]">{pick(it, 'title')}</h2>
                  <div className="mt-3"><Prose text={pick(it, 'content')} /></div>
                  {it.document_url && <div className="mt-4"><DocumentLink url={it.document_url} /></div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </DataState>
    </PageShell>
  );
}
