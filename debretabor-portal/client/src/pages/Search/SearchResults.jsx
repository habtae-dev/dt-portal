// Destination of the header search bar (MegaMenuHeader submits to /search?q=...).
// Searches every public announcement type in parallel (server-side ?search= where the API supports it).
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ANNOUNCEMENT_TYPES } from '../Announcements/announcementTypes';
import { PageShell, Badge, T } from '../../components/ui';

const TYPES = ['news', 'tenders', 'vacancies', 'events', 'notices'];

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = (params.get('q') || '').trim();
  const { lang, pick } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!query) { setGroups([]); setStatus('ready'); return undefined; }
    let cancelled = false;
    setStatus('loading');
    Promise.allSettled(TYPES.map((t) => ANNOUNCEMENT_TYPES[t].fetchList({ search: query, limit: 10 })))
      .then((results) => {
        if (cancelled) return;
        const found = results.map((r, i) => ({ type: TYPES[i], items: r.status === 'fulfilled' ? r.value : [] })).filter((g) => g.items.length);
        setGroups(found);
        setStatus(results.every((r) => r.status === 'rejected') ? 'error' : 'ready');
      });
    return () => { cancelled = true; };
  }, [query]);

  return (
    <PageShell eyebrow={T(lang, 'Search', 'ፍለጋ')} title={query ? `“${query}”` : T(lang, 'Search', 'ፍለጋ')}>
      {!query && <p className="text-gray-500">{T(lang, 'Type something in the search bar above.', 'ከላይ ባለው የፍለጋ ሳጥን ውስጥ ይጻፉ።')}</p>}
      {status === 'loading' && query && <p className="text-gray-500">{T(lang, 'Searching…', 'በመፈለግ ላይ…')}</p>}
      {status === 'error' && <p role="alert" className="text-red-700">{T(lang, 'Search is unavailable right now.', 'ፍለጋ አሁን አይገኝም።')}</p>}
      {status === 'ready' && query && groups.length === 0 && <p className="text-gray-500">{T(lang, 'No results found.', 'ምንም ውጤት አልተገኘም።')}</p>}

      {groups.map(({ type, items }) => {
        const cfg = ANNOUNCEMENT_TYPES[type];
        return (
          <section key={type} className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#004280]">{T(lang, ...cfg.title)}</h2>
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
              {items.map((item) => {
                const badge = cfg.badge(item);
                return (
                  <li key={item.id} className="p-4">
                    <Link to={`${cfg.base}/${item.id}`} className="font-semibold text-[#003366] hover:text-[#cc0000]">{pick(item, cfg.titleField)}</Link>
                    {badge && <span className="ml-2"><Badge tone={badge.tone}>{badge.text}</Badge></span>}
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{pick(item, cfg.summaryField)}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </PageShell>
  );
}
