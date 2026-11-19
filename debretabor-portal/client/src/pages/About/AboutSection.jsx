import { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchAbout } from '../../api/publicApi';
import { PageShell, Picture, Prose, T } from '../../components/ui';

export default function AboutSection({ category, mapHeader = null, fallback = null }) {
  const { lang, pick } = useLanguage();
  const { data, status } = useFetch(() => fetchAbout(category), [category]);

  useEffect(() => { window.scrollTo(0, 0); }, [category]);

  if (status === 'loading') return <div className="min-h-[50vh]" aria-busy="true" />;

  // 1. መረጃ ከዳታቤዝ ካልመጣ (Static Fallback)
  if (!data) {
    return fallback || (
      <PageShell eyebrow={T(lang, 'About Debre Tabor', 'ስለ ደብረ ታቦር')} title={T(lang, 'Coming soon', 'በቅርቡ')}>
        {mapHeader}
        <p className="text-gray-500">{T(lang, 'This page has not been published yet.', 'ይህ ገጽ እስካሁን አልታተመም።')}</p>
      </PageShell>
    );
  }

  // 2. መረጃ ከዳታቤዝ ሲገኝ (ከ Title በታች ይቀመጣል)
  return (
    <PageShell eyebrow={T(lang, 'About Debre Tabor', 'ስለ ደብረ ታቦር')} title={pick(data, 'title')}>
      {/* 1. ካርታው ከ Title በታች እዚህ ይቀመጣል */}
      {mapHeader}

      {/* 2. የዳታቤዝ ፎቶ እና ጽሑፍ ከካርታው በታች ይከተላሉ */}
      <article className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {data.image_url && <Picture src={data.image_url} alt={pick(data, 'title')} className="mb-6 h-72 w-full rounded-lg" />}
        <Prose text={pick(data, 'content')} />
      </article>
    </PageShell>
  );
}