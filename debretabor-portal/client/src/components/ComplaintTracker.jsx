// Citizen enters a tracking code -> GET /api/complaints/track/:code. The API returns only
// citizen-safe fields (tracking_code, department, subject, status, admin_notes, created_at, updated_at).
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trackComplaint } from '../api/publicApi';
import { T, formatDate } from './ui';

// complaints.status ENUM: Pending | In Progress | Resolved | Rejected
const STATUS = {
  Pending: ['Pending', 'በመጠባበቅ ላይ', 'bg-amber-100 text-amber-800 border-amber-300'],
  'In Progress': ['In Progress', 'በሂደት ላይ', 'bg-blue-100 text-blue-800 border-blue-300'],
  Resolved: ['Resolved', 'ተፈትቷል', 'bg-green-100 text-green-800 border-green-300'],
  Rejected: ['Rejected', 'ውድቅ ተደርጓል', 'bg-red-100 text-red-800 border-red-300']
};

export default function ComplaintTracker() {
  const { lang } = useLanguage();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading'); setError(''); setResult(null);
    try {
      setResult(await trackComplaint(code));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || T(lang, 'Could not look up that tracking code.', 'ይህን የመከታተያ ኮድ ማግኘት አልተቻለም።'));
    }
  };

  const st = result && (STATUS[result.status] || [result.status, result.status, 'bg-gray-100 text-gray-700 border-gray-300']);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="tracking-code" className="sr-only">{T(lang, 'Tracking code', 'የመከታተያ ኮድ')}</label>
        <input id="tracking-code" required placeholder="DT-CMP-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 font-mono uppercase tracking-wide focus:border-[#004280] focus:outline-none focus:ring-1 focus:ring-[#004280]" />
        <button type="submit" disabled={status === 'loading'} className="rounded-lg bg-[#004280] px-5 py-2.5 font-semibold text-white hover:bg-[#003366] disabled:opacity-60">
          {status === 'loading' ? T(lang, 'Checking…', 'በመፈተሽ ላይ…') : T(lang, 'Track', 'ተከታተል')}
        </button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-500">{result.tracking_code}</span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${st[2]}`}>{T(lang, st[0], st[1])}</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2"><dt className="text-gray-500">{T(lang, 'Subject', 'ርዕስ')}</dt><dd className="font-medium">{result.subject}</dd></div>
            <div><dt className="text-gray-500">{T(lang, 'Department', 'መምሪያ')}</dt><dd className="font-medium">{result.department}</dd></div>
            <div><dt className="text-gray-500">{T(lang, 'Submitted', 'የገባበት ቀን')}</dt><dd className="font-medium">{formatDate(result.created_at, lang)}</dd></div>
            <div><dt className="text-gray-500">{T(lang, 'Last updated', 'መጨረሻ የተሻሻለ')}</dt><dd className="font-medium">{formatDate(result.updated_at, lang)}</dd></div>
            {result.admin_notes && <div className="col-span-2"><dt className="text-gray-500">{T(lang, 'Response from the administration', 'ከአስተዳደሩ የተሰጠ ምላሽ')}</dt><dd className="whitespace-pre-line font-medium">{result.admin_notes}</dd></div>}
          </dl>
        </div>
      )}
    </div>
  );
}
