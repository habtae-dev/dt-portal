// Target of the "Unsubscribe" link in every e-mail:  /unsubscribe/:token
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { unsubscribeEmail } from '../api/publicApi';
import { PageShell, T } from '../components/ui';

export default function Unsubscribe() {
  const { token } = useParams();
  const { lang } = useLanguage();
  const [state, setState] = useState('idle'); // idle | working | done | error

  const confirm = async () => {
    setState('working');
    try { await unsubscribeEmail(token); setState('done'); } catch { setState('error'); }
  };

  return (
    <PageShell title={T(lang, 'Unsubscribe', 'ምዝገባ ሰርዝ')}>
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm" aria-live="polite">
        {state === 'done' ? (
          <p className="text-green-700 font-semibold">{T(lang, 'You have been unsubscribed. You will no longer receive e-mails from us.', 'ምዝገባዎ ተሰርዟል። ከዚህ በኋላ ኢሜይል አይደርስዎትም።')}</p>
        ) : (
          <>
            <p className="text-gray-700">{T(lang, 'Stop receiving e-mail updates from Debre Tabor City Administration?', 'ከደብረ ታቦር ከተማ አስተዳደር የኢሜይል መረጃዎችን መቀበል ማቆም ይፈልጋሉ?')}</p>
            {state === 'error' && <p role="alert" className="mt-3 text-sm text-red-600">{T(lang, 'This link is not valid or has already been used.', 'ይህ አገናኝ ትክክል አይደለም ወይም ቀድሞ ጥቅም ላይ ውሏል።')}</p>}
            <button onClick={confirm} disabled={state === 'working'} className="mt-5 rounded-lg bg-[#004280] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003366] disabled:opacity-60">
              {T(lang, 'Yes, unsubscribe me', 'አዎ፣ ሰርዙኝ')}
            </button>
          </>
        )}
        <div className="mt-6"><Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">{T(lang, 'Back to home', 'ወደ መነሻ ገጽ')}</Link></div>
      </div>
    </PageShell>
  );
}
