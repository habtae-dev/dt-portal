// components/Footer.jsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { T } from './ui';
import SubscribeForm from './SubscribeForm';
import { SITE } from '../config';

export default function Footer() {
  const { lang, t } = useLanguage();
  const { address, email, phone } = SITE.contact;

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="border-b border-gray-800">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 lg:px-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-lg font-bold text-white">{T(lang, 'Subscribe to city updates', 'የከተማ መረጃዎችን ይቀበሉ')}</h3>
            <p className="mt-1 text-sm text-gray-400">{T(lang, 'Complaint responses, vacancies, tenders, news and notices by e-mail.', 'የቅሬታ ምላሾች፣ ክፍት የሥራ ቦታዎች፣ ጨረታዎች፣ ዜናዎች እና ማስታወቂያዎች በኢሜይል።')}</p>
          </div>
          <SubscribeForm variant="footer" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-white">{T(lang, 'Debre Tabor City Administration', 'የደብረ ታቦር ከተማ አስተዳደር')}</h3>
          <p className="mt-2 text-sm">{T(lang, 'Amhara Region, Ethiopia', 'አማራ ክልል፣ ኢትዮጵያ')}</p>
          {(address || email || phone) && (
            <ul className="mt-4 space-y-1 text-sm">
              {address && <li>{address}</li>}
              {email && <li><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>}
              {phone && <li><a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white">{phone}</a></li>}
            </ul>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-white">{t('services')}</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li><Link to="/services/online" className="hover:text-white">{t('fileComplaint')}</Link></li>
            <li><Link to="/services/online" className="hover:text-white">{t('trackComplaint')}</Link></li>
            <li><Link to="/explore/business" className="hover:text-white">{t('businessLicensing')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">{t('resources')}</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li><Link to="/announcements/tender" className="hover:text-white">{t('tenders')}</Link></li>
            <li><Link to="/announcements/vacancy" className="hover:text-white">{t('vacancies')}</Link></li>
            <li><Link to="/announcements/notices" className="hover:text-white">{t('notices')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">{T(lang, 'Administration', 'አስተዳደር')}</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li><a href={SITE.adminUrl} className="hover:text-white">{t('adminLogin')}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {T(lang, 'Debre Tabor City Administration. All rights reserved.', 'የደብረ ታቦር ከተማ አስተዳደር። መብቱ በህግ የተጠበቀ ነው።')}
      </div>
    </footer>
  );
}
