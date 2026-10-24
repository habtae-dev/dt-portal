import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchProjects, asArray } from '../../api/publicApi';
import { PageShell, DataState, Picture, DocumentLink, Prose, Badge, formatDate, T } from '../../components/ui';

// projects.category ENUM: Program | Project   ·   projects.status ENUM: Planned | Ongoing | Completed | On Hold
const CATEGORIES = { Program: ['Programs', 'ፕሮግራሞች'], Project: ['Projects', 'ፕሮጀክቶች'] };
const STATUS = {
  Planned: ['Planned', 'የታቀደ', 'gray'], Ongoing: ['Ongoing', 'በሂደት ላይ', 'blue'],
  Completed: ['Completed', 'የተጠናቀቀ', 'green'], 'On Hold': ['On Hold', 'የታገደ', 'amber']
};

const money = (v, lang) => (v === null || v === undefined || v === '' ? '' : `${Number(v).toLocaleString(lang === 'am' ? 'am-ET' : 'en-US')} ETB`);

export default function ProjectsPage({ category }) {
  const { lang, pick } = useLanguage();
  const state = useFetch(() => fetchProjects(category), [category]);
  return (
    <PageShell eyebrow={T(lang, 'Programs & Projects', 'ፕሮግራሞችና ፕሮጀክቶች')} title={T(lang, ...CATEGORIES[category])}>
      <DataState state={state}>
        {(items) => (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((p) => {
              const st = STATUS[p.status] || [p.status, p.status, 'gray'];
              return (
                <article key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <Picture src={asArray(p.images)[0]} alt={pick(p, 'title')} className="h-48 w-full" />
                  <div className="p-5">
                    <Badge tone={st[2]}>{T(lang, st[0], st[1])}</Badge>
                    <h2 className="mt-2 text-lg font-bold text-[#003366]">{pick(p, 'title')}</h2>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                      {p.budget !== null && <div><dt className="font-bold">{T(lang, 'Budget', 'በጀት')}</dt><dd>{money(p.budget, lang)}</dd></div>}
                      {pick(p, 'location') && <div><dt className="font-bold">{T(lang, 'Location', 'ቦታ')}</dt><dd>{pick(p, 'location')}</dd></div>}
                      {p.start_date && <div><dt className="font-bold">{T(lang, 'Start', 'መጀመሪያ')}</dt><dd>{formatDate(p.start_date, lang)}</dd></div>}
                      {p.end_date && <div><dt className="font-bold">{T(lang, 'End', 'መጨረሻ')}</dt><dd>{formatDate(p.end_date, lang)}</dd></div>}
                    </dl>
                    <div className="mt-3"><Prose text={pick(p, 'description')} /></div>
                    {p.document_url && <div className="mt-4"><DocumentLink url={p.document_url} /></div>}
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
