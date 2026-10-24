// Small presentational pieces shared by every data-driven public page.
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../api/publicApi';

export const T = (lang, en, am) => (lang === 'am' ? am : en);

export function formatDate(value, lang, withTime = false) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(lang === 'am' ? 'am-ET' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export const formatTime = (value) => (value ? String(value).slice(0, 5) : '');

export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-[#003366] to-[#004280] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm sm:text-base text-blue-100 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}

// Standard page frame: banner + constrained, bilingual-aware content area.
export function PageShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="bg-gray-50 min-h-[60vh]">
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</div>
    </div>
  );
}

// Renders loading / error / empty states, then the children (called with the loaded data).
export function DataState({ state, empty, children }) {
  const { lang } = useLanguage();
  if (state.status === 'loading') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-200 animate-pulse" />)}
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-center justify-between gap-4">
        <span>{state.error}</span>
        {state.reload && <button onClick={state.reload} className="font-semibold underline">{T(lang, 'Retry', 'እንደገና ሞክር')}</button>}
      </div>
    );
  }
  const data = state.data;
  if (Array.isArray(data) ? data.length === 0 : !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        {empty || T(lang, 'No content has been published here yet.', 'እስካሁን ምንም ይዘት አልታተመም።')}
      </div>
    );
  }
  return children(data);
}

export function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800', gray: 'bg-gray-100 text-gray-700'
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone] || tones.blue}`}>{children}</span>;
}

export function DocumentLink({ url, label }) {
  const { lang } = useLanguage();
  if (!url) return null;
  return (
    <a href={assetUrl(url)} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-2 rounded-lg bg-[#004280] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003366]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M5 21h14a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0014.586 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      {label || T(lang, 'Download document', 'ሰነድ አውርድ')}
    </a>
  );
}

// Image with a graceful empty state.
export function Picture({ src, alt, className = '' }) {
  if (!src) {
    return <div className={`flex items-center justify-center bg-gradient-to-br from-[#003366] to-[#004280] text-white/40 ${className}`}>
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    </div>;
  }
  return <img src={assetUrl(src)} alt={alt || ''} loading="lazy" className={`object-cover ${className}`} />;
}

export function Prose({ text }) {
  if (!text) return null;
  return <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{text}</p>;
}
