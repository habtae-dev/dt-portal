import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import ComplaintForm from '../../components/ComplaintForm';
import ComplaintTracker from '../../components/ComplaintTracker';
import { PageShell, T } from '../../components/ui';

export default function ServicesPage() {
  const { lang } = useLanguage();
  const { hash } = useLocation();

  // footer links point at /services/online#complaint and #track
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <PageShell eyebrow={T(lang, 'Services', 'አገልግሎቶች')} title={T(lang, 'Online Services', 'የኦንላይን አገልግሎቶች')}
      subtitle={T(lang, 'Submit a complaint about a city service, or check the status of one you already filed.', 'ስለ ከተማ አገልግሎት ቅሬታ ያስገቡ፣ ወይም ያስገቡትን ቅሬታ ሁኔታ ይከታተሉ።')}>
      <div className="grid gap-10 lg:grid-cols-2">
        <section id="complaint">
          <h2 className="mb-4 text-xl font-bold text-[#003366]">{T(lang, 'File a Complaint', 'ቅሬታ ያስገቡ')}</h2>
          <ComplaintForm />
        </section>
        <section id="track">
          <h2 className="mb-4 text-xl font-bold text-[#003366]">{T(lang, 'Track a Complaint', 'ቅሬታ ይከታተሉ')}</h2>
          <ComplaintTracker />
        </section>
      </div>
    </PageShell>
  );
}
