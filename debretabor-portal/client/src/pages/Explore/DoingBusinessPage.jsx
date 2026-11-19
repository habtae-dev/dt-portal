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

const LIMIT = 10;

export default function DoingBusinessPage() {
  const { lang, pick } = useLanguage();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // category ወይም page ሲቀየር መረጃውን ከ backend በ pagination መልክ ማምጣት
  const state = useFetch(
    () => fetchBusiness({ category: category || undefined, page, limit: LIMIT }),
    [category, page]
  );

  // ምድብ ሲቀየር ሁልጊዜ ወደ ገጽ 1 መመለስ
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  // Backend የሚልከውን Object ፎርማት (res.data ወይም res) ተቀብሎ Array ብቻ መለየት
  const responseData = state.data;
  const itemsArray = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : [];

  const total = responseData?.total || itemsArray.length;
  const totalPages = Math.ceil(total / LIMIT);

  // DataState የሚጠብቀውን ቅርጽ ማስተካከል
  const shownState = {
    ...state,
    data: itemsArray
  };

  return (
    <PageShell eyebrow={T(lang, 'Explore Debre Tabor', 'ደብረ ታቦርን ይጎብኙ')} title={T(lang, 'Doing Business', 'ንግድና ኢንቨስትመንት')}>
      <div className="mb-8 flex flex-wrap gap-2">
        {[['', ['All', 'ሁሉም']], ...CATEGORIES.map((c) => [c[0], c])].map(([value, label]) => (
          <button 
            key={value || 'all'} 
            onClick={() => handleCategoryChange(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${category === value ? 'bg-[#004280] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-150'}`}
          >
            {T(lang, ...label)}
          </button>
        ))}
      </div>

      <DataState state={shownState}>
        {(items) => (
          <>
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

            {/* Pagination Controls (በሰማያዊ ከለር bg-[#004280] እና ነጭ ጽሁፍ የተስተካከሉ አዝራሮች) */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-6 pt-6">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="rounded-xl bg-[#004280] px-6 py-2.5 text-base font-bold text-white transition hover:bg-[#003366] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>

                <span className="text-sm font-bold text-[#003366]">
                  {T(lang, `Page ${page} of ${totalPages}`, `ገጽ ${page} ከ ${totalPages}`)}
                </span>

                <button
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page >= totalPages}
                  className="rounded-xl bg-[#004280] px-6 py-2.5 text-base font-bold text-white transition hover:bg-[#003366] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </DataState>
    </PageShell>
  );
}