import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchBusiness } from '../../api/publicApi';
import { PageShell, DataState, DocumentLink, Prose, T } from '../../components/ui';

// doing_business.category ENUM, with Amharic labels for the filter tabs
const CATEGORIES = [
  ['Investment Guide', 'የኢንቨስትመንት መመሪያ'],
  ['Business License', 'የንግድ ፈቃድ'],
  ['Incentives', 'ማበረታቻዎች'],
  ['Opportunities', 'ዕድሎች']
];

export default function DoingBusinessPage() {
  const { lang, pick } = useLanguage();
  const [category, setCategory] = useState('');
  const state = useFetch(() => fetchBusiness(category || undefined), [category]);
  return (
    <PageShell eyebrow={T(lang, 'Explore Debre Tabor', 'ደብረ ታቦርን ይጎብኙ')} title={T(lang, 'Doing Business', 'ንግድና ኢንቨስትመንት')}>
      <div className="mb-8 flex flex-wrap gap-2">
        {[['', ['All', 'ሁሉም']], ...CATEGORIES.map((c) => [c[0], c])].map(([value, label]) => (
          <button key={value || 'all'} onClick={() => setCategory(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${category === value ? 'bg-[#004280] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
            {T(lang, ...label)}
          </button>
        ))}
      </div>
      <DataState state={state}>
        {(items) => (
          <div className="space-y-6">
            {items.map((b) => (
              <article key={b.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wide text-[#cc0000]">{T(lang, ...(CATEGORIES.find((c) => c[0] === b.category) || [b.category, b.category]))}</span>
                <h2 className="mt-1 text-xl font-bold text-[#003366]">{pick(b, 'title')}</h2>
                <div className="mt-3"><Prose text={pick(b, 'content')} /></div>
                {b.document_url && <div className="mt-4"><DocumentLink url={b.document_url} /></div>}
              </article>
            ))}
          </div>
        )}
      </DataState>
    </PageShell>
  );
}
