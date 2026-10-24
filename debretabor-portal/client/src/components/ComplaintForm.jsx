// Citizen complaint submission -> POST /api/complaints/submit (multipart: optional attachment).
// Fields match the `complaints` table: citizen_name, phone, email, department, subject, description.
// On success the tracking code is shown persistently (not a toast): the citizen must note it down.
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { submitComplaint, subscribeEmail } from '../api/publicApi';
import { T } from './ui';

const DEPARTMENTS = [
  ['Water Supply', 'የውሃ አቅርቦት'], ['Road & Infrastructure', 'መንገድና መሠረተ ልማት'], ['Electricity', 'ኤሌክትሪክ'],
  ['Waste Management', 'የቆሻሻ አያያዝ'], ['Land Administration', 'የመሬት አስተዳደር'], ['Health Services', 'የጤና አገልግሎት'],
  ['Trade & Licensing', 'ንግድና ፈቃድ'], ['Other', 'ሌላ']
];
const EMPTY = { citizen_name: '', phone: '', email: '', department: '', subject: '', description: '' };
const field = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004280] focus:outline-none focus:ring-1 focus:ring-[#004280]';

export default function ComplaintForm() {
  const { lang } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [code, setCode] = useState('');
  const [mailed, setMailed] = useState('');      // address the confirmation was sent to
  const [alsoSubscribe, setAlsoSubscribe] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
      if (file) data.append('attachment', file);
      const res = await submitComplaint(data);
      if (form.email && alsoSubscribe) subscribeEmail(form.email.trim(), lang).catch(() => {}); // optional extra: city updates
      setMailed(form.email.trim());
      setCode(res.tracking_code); setStatus('success'); setForm(EMPTY); setFile(null); setAlsoSubscribe(false);
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || T(lang, 'Could not submit your complaint. Please try again.', 'ቅሬታዎን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።'));
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-8 text-center">
        <p className="text-sm font-medium text-green-700">{T(lang, 'Complaint submitted', 'ቅሬታዎ ተመዝግቧል')}</p>
        <p className="mt-2 font-mono text-3xl font-bold tracking-wide text-green-900 select-all">{code}</p>
        <p className="mt-3 text-sm text-gray-600">{T(lang, "Save this tracking code — you'll need it to check your complaint's status.", 'ይህን የመከታተያ ኮድ ያስቀምጡ — የቅሬታዎን ሁኔታ ለማየት ያስፈልግዎታል።')}</p>
        {mailed && <p className="mt-2 text-sm text-gray-600">{T(lang, `We also sent the code to ${mailed}. You will receive an e-mail whenever the office updates or answers your complaint.`, `ኮዱን ወደ ${mailed} ልከናል። ጽህፈት ቤቱ ቅሬታዎን ሲያሻሽል ወይም ሲመልስ በኢሜይል ይደርስዎታል።`)}</p>}
        <button onClick={() => { setStatus('idle'); setCode(''); setMailed(''); }} className="mt-5 rounded-md bg-[#004280] px-4 py-2 text-sm font-medium text-white hover:bg-[#003366]">
          {T(lang, 'Submit another complaint', 'ሌላ ቅሬታ ያስገቡ')}
        </button>
      </div>
    );
  }

  const label = (en, am, req) => <>{T(lang, en, am)}{req && <span className="text-red-600"> *</span>}</>;
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      {error && <div role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">{label('Full name', 'ሙሉ ስም', true)}
          <input name="citizen_name" required maxLength={150} value={form.citizen_name} onChange={change} className={field} /></label>
        <label className="block text-sm font-medium text-gray-700">{label('Phone number', 'ስልክ ቁጥር', true)}
          <input name="phone" type="tel" required maxLength={30} value={form.phone} onChange={change} className={field} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">{label('Email (optional)', 'ኢሜይል (አማራጭ)')}
          <input name="email" type="email" maxLength={150} value={form.email} onChange={change} className={field} aria-describedby="email-help" />
          <span id="email-help" className="mt-1 block text-xs font-normal text-gray-500">{T(lang, 'Give your e-mail to receive status updates and the office’s response.', 'የሁኔታ ማሻሻያዎችን እና የጽህፈት ቤቱን ምላሽ ለመቀበል ኢሜይልዎን ያስገቡ።')}</span></label>
        <label className="block text-sm font-medium text-gray-700">{label('Department', 'መምሪያ', true)}
          <select name="department" required value={form.department} onChange={change} className={field}>
            <option value="" disabled>{T(lang, 'Select a department', 'መምሪያ ይምረጡ')}</option>
            {DEPARTMENTS.map(([en, am]) => <option key={en} value={en}>{T(lang, en, am)}</option>)}
          </select></label>
      </div>
      <label className="block text-sm font-medium text-gray-700">{label('Subject', 'ርዕስ', true)}
        <input name="subject" required maxLength={255} value={form.subject} onChange={change} className={field} /></label>
      <label className="block text-sm font-medium text-gray-700">{label('Describe the issue', 'ጉዳዩን ይግለጹ', true)}
        <textarea name="description" required rows={5} maxLength={5000} value={form.description} onChange={change} className={field} /></label>
      <label className="block text-sm font-medium text-gray-700">{label('Attachment (image or PDF, max 10 MB)', 'አባሪ (ምስል ወይም PDF፣ ከፍተኛ 10 ሜባ)')}
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} className="mt-1 block w-full text-sm" /></label>

      {form.email && (
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={alsoSubscribe} onChange={(e) => setAlsoSubscribe(e.target.checked)} className="mt-1" />
          {T(lang, 'Also send me city news, vacancies and tenders by e-mail.', 'የከተማ ዜናዎችን፣ ክፍት የሥራ ቦታዎችን እና ጨረታዎችን በኢሜይል ላኩልኝ።')}
        </label>
      )}

      <button type="submit" disabled={status === 'loading'} className="w-full rounded-lg bg-[#cc0000] px-4 py-3 font-semibold text-white hover:bg-[#a30000] disabled:opacity-60">
        {status === 'loading' ? T(lang, 'Submitting…', 'በማስገባት ላይ…') : T(lang, 'Submit complaint', 'ቅሬታ አስገባ')}
      </button>
    </form>
  );
}
