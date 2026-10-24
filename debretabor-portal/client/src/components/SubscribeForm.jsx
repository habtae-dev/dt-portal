// E-mail subscription form. variant="band" (home page, light card) or "footer" (dark footer).
import { useId, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeEmail } from '../api/publicApi';
import { T } from './ui';

export default function SubscribeForm({ variant = 'band' }) {
  const { lang } = useLanguage();
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' }); // idle | sending | done | error
  const dark = variant === 'footer';

  const submit = async (e) => {
    e.preventDefault();
    if (state.status === 'sending') return;
    setState({ status: 'sending', msg: '' });
    try {
      await subscribeEmail(email.trim(), lang);
      setEmail('');
      setState({ status: 'done', msg: T(lang, 'Thank you! You are subscribed.', 'እናመሰግናለን! ተመዝግበዋል።') });
    } catch (err) {
      const m = err.response?.status === 429 ? T(lang, 'Too many attempts. Please try again later.', 'ብዙ ሙከራ አድርገዋል። ቆይተው ይሞክሩ።')
        : err.response?.status === 400 ? T(lang, 'Please enter a valid e-mail address.', 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።')
        : T(lang, 'Could not subscribe right now. Please try again.', 'አሁን መመዝገብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
      setState({ status: 'error', msg: m });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor={id} className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
        {T(lang, 'Your e-mail address', 'የኢሜይል አድራሻዎ')}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={id} type="email" required autoComplete="email" inputMode="email" maxLength={150}
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          aria-describedby={`${id}-msg`}
          className={`min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${dark ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
        />
        <button type="submit" disabled={state.status === 'sending'}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-gray-950 hover:bg-amber-600 disabled:opacity-60">
          {state.status === 'sending' ? T(lang, 'Subscribing…', 'በመመዝገብ ላይ…') : T(lang, 'Subscribe', 'ተመዝገብ')}
        </button>
      </div>
      <p id={`${id}-msg`} role="status" aria-live="polite"
        className={`mt-2 min-h-[1.25rem] text-xs ${state.status === 'error' ? (dark ? 'text-red-300' : 'text-red-600') : state.status === 'done' ? (dark ? 'text-green-300' : 'text-green-700') : (dark ? 'text-gray-400' : 'text-gray-500')}`}>
        {state.msg || T(lang, 'We only e-mail you about city updates. Unsubscribe any time.', 'ስለ ከተማ መረጃዎች ብቻ ኢሜይል እንልካለን። በማንኛውም ጊዜ መሰረዝ ይችላሉ።')}
      </p>
    </form>
  );
}

// Home-page section placed after "Latest Updates".
export function SubscribeBand() {
  const { lang } = useLanguage();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" aria-labelledby="subscribe-heading">
      <div className="grid gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-md md:grid-cols-2 md:items-center md:p-10">
        <div>
          <h2 id="subscribe-heading" className="text-2xl font-extrabold text-gray-900">{T(lang, 'Get city updates by e-mail', 'የከተማ መረጃዎችን በኢሜይል ያግኙ')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {T(lang, 'Receive responses to your complaints, new job vacancies, tenders, news and notices straight to your inbox.', 'የቅሬታ ምላሾችን፣ አዳዲስ ክፍት የሥራ ቦታዎችን፣ ጨረታዎችን፣ ዜናዎችን እና ማስታወቂያዎችን በቀጥታ ወደ ኢሜይልዎ ይቀበሉ።')}
          </p>
        </div>
        <SubscribeForm variant="band" />
      </div>
    </section>
  );
}
