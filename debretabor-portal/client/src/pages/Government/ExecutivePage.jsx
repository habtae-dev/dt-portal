import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchExecutive } from '../../api/publicApi';
import { PageShell, DataState, Picture, DocumentLink, Prose, T } from '../../components/ui';

// category values are the executive_contents ENUM: mayor | cabinet | structure | bureau
const CATEGORIES = {
  mayor: ['Mayor', 'ከንቲባ'],
  cabinet: ['Cabinet', 'ካቢኔ'],
  structure: ['Executive Structure', 'የአስፈፃሚ መዋቅር'],
  bureau: ['Bureaus', 'ቢሮዎች']
};

export default function ExecutivePage({ category }) {
  const { lang, pick } = useLanguage();
  const state = useFetch(() => fetchExecutive(category), [category]);
  return (
    <PageShell eyebrow={T(lang, 'City Government', 'የከተማ አስተዳደር')} title={T(lang, ...CATEGORIES[category])}>
      <DataState state={state}>
        {(items) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <article key={it.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Picture src={it.image_url} alt={pick(it, 'person_name') || pick(it, 'title')} className="h-56 w-full" />
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold text-[#003366]">{pick(it, 'title')}</h2>
                  {pick(it, 'person_name') && <p className="mt-1 font-semibold text-gray-900">{pick(it, 'person_name')}</p>}
                  {pick(it, 'position') && <p className="text-sm text-[#cc0000]">{pick(it, 'position')}</p>}
                  <div className="mt-3 flex-1"><Prose text={pick(it, 'content')} /></div>
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
