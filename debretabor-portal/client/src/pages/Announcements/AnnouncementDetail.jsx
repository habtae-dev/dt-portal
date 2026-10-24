import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { ANNOUNCEMENT_TYPES } from './announcementTypes';
import { PageShell, DataState, Badge, Picture, DocumentLink, Prose, T } from '../../components/ui';

export default function AnnouncementDetail({ type }) {
  const cfg = ANNOUNCEMENT_TYPES[type];
  const { id } = useParams();
  const { lang, pick } = useLanguage();
  const state = useFetch(() => cfg.fetchOne(id), [type, id]);
  const [active, setActive] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); setActive(0); }, [type, id]);

  const item = state.data;
  useEffect(() => {
    if (item) document.title = `${pick(item, cfg.titleField)} - ${T(lang, 'Debre Tabor City Portal', 'የደብረ ታቦር ከተማ ፖርታል')}`;
  }, [item, lang, cfg, pick]);

  // A 404 is shown as "not found" rather than the generic load error.
  const notFound = state.status === 'error' && /not found/i.test(state.error);
  const shown = notFound ? { ...state, status: 'ready', data: null } : state;

  return (
    <PageShell eyebrow={T(lang, ...cfg.title)} title={item ? pick(item, cfg.titleField) : T(lang, 'Loading…', 'በመጫን ላይ…')}>
      <Link to={cfg.base} className="mb-6 inline-block text-sm font-semibold text-[#004280] hover:underline">← {T(lang, 'Back to', 'ወደ')} {T(lang, ...cfg.title)}</Link>
      <DataState state={shown} empty={T(lang, 'This item was not found, or is no longer available.', 'ይህ ጽሑፍ አልተገኘም ወይም አሁን አይገኝም።')}>
        {(it) => {
          const badge = cfg.badge(it);
          const images = cfg.imageField ? [it[cfg.imageField]].filter(Boolean) : (cfg.images ? cfg.images(it) : []);
          const facts = cfg.facts(it, lang, pick).filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
          return (
            <article className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
                <span className="text-sm text-gray-500">{cfg.date(it, lang)}</span>
              </div>

              {images.length > 0 && (
                <div className="mb-6">
                  <Picture src={images[active]} alt={pick(it, cfg.titleField)} className="h-72 sm:h-96 w-full rounded-lg" />
                  {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {images.map((src, i) => (
                        <button key={src} onClick={() => setActive(i)} aria-label={`${T(lang, 'Image', 'ምስል')} ${i + 1}`}
                          className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 ${i === active ? 'border-[#004280]' : 'border-transparent'}`}>
                          <Picture src={src} alt="" className="h-full w-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {facts.length > 0 && (
                <dl className="mb-6 grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                  {facts.map((f) => (
                    <div key={f.label[0]}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{T(lang, ...f.label)}</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-sm font-medium text-gray-900">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <Prose text={pick(it, cfg.bodyField)} />
              {cfg.documentField && it[cfg.documentField] && <div className="mt-6"><DocumentLink url={it[cfg.documentField]} /></div>}
            </article>
          );
        }}
      </DataState>
    </PageShell>
  );
}
