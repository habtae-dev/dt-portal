import { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchAbout } from '../../api/publicApi';
import { PageShell, Picture, Prose, T } from '../../components/ui';

// about_city.category ENUM: history | geography | community | city_administration
// Shows the content edited in the admin dashboard (English / Amharic). If nothing is published for the
// section yet (or the API is unreachable) it renders `fallback` - the built-in static page.
export default function AboutSection({ category, fallback = null }) {
  const { lang, pick } = useLanguage();
  const { data, status } = useFetch(() => fetchAbout(category), [category]);

  useEffect(() => { window.scrollTo(0, 0); }, [category]);

  if (status === 'loading') return <div className="min-h-[50vh]" aria-busy="true" />;
  if (!data) {
    return fallback || (
      <PageShell eyebrow={T(lang, 'About Debre Tabor', 'ስለ ደብረ ታቦር')} title={T(lang, 'Coming soon', 'በቅርቡ')}>
        <p className="text-gray-500">{T(lang, 'This page has not been published yet.', 'ይህ ገጽ እስካሁን አልታተመም።')}</p>
      </PageShell>
    );
  }
  return (
    <PageShell eyebrow={T(lang, 'About Debre Tabor', 'ስለ ደብረ ታቦር')} title={pick(data, 'title')}>
      <article className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {data.image_url && <Picture src={data.image_url} alt={pick(data, 'title')} className="mb-6 h-72 w-full rounded-lg" />}
        <Prose text={pick(data, 'content')} />
      </article>
    </PageShell>
  );
}
