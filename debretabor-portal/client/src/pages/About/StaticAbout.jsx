import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { PageShell, T } from '../../components/ui';

// Built-in bilingual copy for an About page, shown until the section is published from the admin dashboard.
// `data` uses the `<field>_en / <field>_am` convention: pageTitle, subtitle, introHeading, introText1/2, sec1..4Title/Text, imgCaption.
// The first two sections are always visible; sections 3-4 sit behind "Show more".
export default function StaticAbout({ data, image, children }) {
  const { lang, pick } = useLanguage();
  const [more, setMore] = useState(false);

  const Section = ({ n }) => (
    <section className="pt-6 first:pt-0 border-t first:border-t-0 border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">{pick(data, `sec${n}Title`)}</h3>
      <p className="mt-2 text-gray-700 leading-relaxed">{pick(data, `sec${n}Text`)}</p>
    </section>
  );

  return (
    <PageShell eyebrow={T(lang, 'About Debre Tabor', 'ስለ ደብረ ታቦር')} title={pick(data, 'pageTitle')} subtitle={pick(data, 'subtitle')}>
      <article className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {image && (
          <figure className="mb-8">
            <img src={image} alt={pick(data, 'imgCaption')} className="h-64 sm:h-96 w-full rounded-lg object-cover" />
            <figcaption className="mt-2 text-xs sm:text-sm text-gray-500">{pick(data, 'imgCaption')}</figcaption>
          </figure>
        )}
        {children}
        <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
          <h2 className="text-2xl font-bold text-gray-900">{pick(data, 'introHeading')}</h2>
          <p>{pick(data, 'introText1')}</p>
          <p>{pick(data, 'introText2')}</p>
        </div>
        <div className="mt-8 space-y-6">
          <Section n={1} />
          <Section n={2} />
          {more && <><Section n={3} /><Section n={4} /></>}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-200 pt-6">
          <Link to="/" className="rounded-lg bg-gray-800 px-6 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-900">&larr; {pick(data, 'backBtn')}</Link>
          <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
            {more ? pick(data, 'showLess') : pick(data, 'showMore')} {more ? '↑' : '↓'}
          </button>
        </div>
      </article>
    </PageShell>
  );
}
