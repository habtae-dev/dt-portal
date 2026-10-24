import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { ANNOUNCEMENT_TYPES } from './announcementTypes';
import { PageShell, DataState, Badge, Picture, T } from '../../components/ui';

const clip = (s, n = 180) => (s && s.length > n ? `${s.slice(0, n).trim()}…` : s || '');

// Generic list page for news / tenders / vacancies / events / notices.
export default function AnnouncementsPage({ type }) {
  const cfg = ANNOUNCEMENT_TYPES[type];
  const { lang, pick } = useLanguage();
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('');

  const state = useFetch(() => cfg.fetchList(status ? { status } : undefined), [type, status]);

  useEffect(() => {
    document.title = `${T(lang, ...cfg.title)} - ${T(lang, 'Debre Tabor City Portal', 'የደብረ ታቦር ከተማ ፖርታል')}`;
    window.scrollTo(0, 0);
  }, [lang, cfg]);

  // reset the search box when moving between types (the component instance is reused by the router)
  useEffect(() => { setTerm(''); setStatus(''); }, [type]);

  const visible = useMemo(() => {
    const items = state.data || [];
    const q = term.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => JSON.stringify(i).toLowerCase().includes(q));
  }, [state.data, term]);

  const shown = { ...state, data: state.status === 'ready' ? visible : state.data };

  return (
    <PageShell eyebrow={T(lang, 'Announcements', 'ማስታወቂያዎች')} title={T(lang, ...cfg.title)} subtitle={T(lang, ...cfg.subtitle)}>
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search" value={term} onChange={(e) => setTerm(e.target.value)}
          placeholder={T(lang, ...cfg.searchPlaceholder)} aria-label={T(lang, ...cfg.searchPlaceholder)}
          className="w-full sm:w-96 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004280]"
        />
        {cfg.statusFilter && (
          <div className="flex flex-wrap gap-2">
            {['', ...cfg.statusFilter].map((s) => (
              <button key={s || 'all'} onClick={() => setStatus(s)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${status === s ? 'bg-[#004280] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s || T(lang, 'All', 'ሁሉም')}
              </button>
            ))}
          </div>
        )}
      </div>

      <DataState state={shown} empty={term ? T(lang, 'Nothing matches your search.', 'ከፍለጋዎ ጋር የሚዛመድ ነገር የለም።') : undefined}>
        {(items) => (
          items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">{T(lang, 'Nothing matches your search.', 'ከፍለጋዎ ጋር የሚዛመድ ነገር የለም።')}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const badge = cfg.badge(item);
                const image = cfg.imageField ? item[cfg.imageField] : (cfg.images ? cfg.images(item)[0] : null);
                return (
                  <Link key={item.id} to={`${cfg.base}/${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    {(cfg.imageField || cfg.images) && <Picture src={image} alt="" className="h-44 w-full" />}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        {badge ? <Badge tone={badge.tone}>{badge.text}</Badge> : <span />}
                        <span className="text-xs text-gray-500">
                          {cfg.dateLabel ? `${T(lang, ...cfg.dateLabel)}: ` : ''}{cfg.date(item, lang)}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#003366] group-hover:text-[#cc0000]">{pick(item, cfg.titleField)}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{clip(pick(item, cfg.summaryField))}</p>
                      <span className="mt-4 text-sm font-semibold text-[#004280]">{T(lang, 'Read more', 'ተጨማሪ ያንብቡ')} →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </DataState>
    </PageShell>
  );
}
