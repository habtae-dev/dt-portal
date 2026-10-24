// One declarative config per announcement type. The generic list and detail pages
// (AnnouncementsPage.jsx / AnnouncementDetail.jsx) render everything from this, so a new field or a new
// type is a change here, not in four near-identical 400-line pages.
// Column names follow the SQL schema exactly (news, tenders, vacancies, events, noticeboard).
import {
  fetchNews, fetchNewsById, fetchTenders, fetchTenderById, fetchVacancies, fetchVacancyById,
  fetchEvents, fetchEventById, fetchNotices, fetchNoticeById, asArray
} from '../../api/publicApi';
import { formatDate, formatTime } from '../../components/ui';

const row = (labelEn, labelAm, value) => ({ label: [labelEn, labelAm], value });

export const ANNOUNCEMENT_TYPES = {
  news: {
    base: '/announcements/news',
    title: ['News', 'ዜናዎች'],
    subtitle: ['The latest news from Debre Tabor City Administration.', 'ከደብረ ታቦር ከተማ አስተዳደር የሚወጡ ወቅታዊ ዜናዎች።'],
    searchPlaceholder: ['Search news...', 'ዜና ይፈልጉ...'],
    fetchList: fetchNews, fetchOne: fetchNewsById,
    titleField: 'title', summaryField: 'content', bodyField: 'content',
    badge: (i) => ({ text: i.category, tone: 'blue' }),
    date: (i, lang) => formatDate(i.created_at, lang),
    images: (i) => asArray(i.images),
    facts: () => []
  },
  tenders: {
    base: '/announcements/tender',
    title: ['Tenders', 'ጨረታዎች'],
    subtitle: ['Open procurement notices and bidding documents.', 'ክፍት የግዥ ማስታወቂያዎችና የጨረታ ሰነዶች።'],
    searchPlaceholder: ['Search by title or reference number...', 'በርዕስ ወይም በማጣቀሻ ቁጥር ይፈልጉ...'],
    fetchList: fetchTenders, fetchOne: fetchTenderById,
    titleField: 'title', summaryField: 'description', bodyField: 'description',
    statusFilter: ['Open', 'Closed', 'Awarded'],
    badge: (i) => ({ text: i.status, tone: i.status === 'Open' ? 'green' : i.status === 'Awarded' ? 'blue' : 'gray' }),
    date: (i, lang) => formatDate(i.created_at, lang),
    documentField: 'document_url',
    facts: (i, lang, pick) => [
      row('Reference No.', 'ማጣቀሻ ቁጥር', i.reference_no),
      row('Closing date', 'የመዝጊያ ቀን', formatDate(i.closing_date, lang, true)),
      row('Submit bids at', 'የሚቀርብበት ቦታ', i.submission_place),
      row('Instructions', 'መመሪያ', pick(i, 'submission_instructions'))
    ]
  },
  vacancies: {
    base: '/announcements/vacancy',
    title: ['Job Vacancies', 'የሥራ ክፍት ቦታዎች'],
    subtitle: ['Current job openings in Debre Tabor City Administration.', 'በደብረ ታቦር ከተማ አስተዳደር ያሉ ወቅታዊ የሥራ ማስታወቂያዎች።'],
    searchPlaceholder: ['Search by position or department...', 'በመደብ ወይም በመምሪያ ይፈልጉ...'],
    fetchList: fetchVacancies, fetchOne: fetchVacancyById,
    titleField: 'position_title', summaryField: 'description', bodyField: 'description',
    statusFilter: ['Open', 'Closed'],
    badge: (i) => ({ text: i.status, tone: i.status === 'Open' ? 'green' : 'gray' }),
    date: (i, lang) => formatDate(i.deadline, lang),
    dateLabel: ['Deadline', 'ማብቂያ'],
    documentField: 'document_url',
    facts: (i, lang, pick) => [
      row('Job code', 'የሥራ ኮድ', i.job_code),
      row('Department', 'መምሪያ', i.department),
      row('Employment type', 'የቅጥር ዓይነት', i.employment_type),
      row('Positions', 'የቦታ ብዛት', i.quantity),
      row('Deadline', 'ማብቂያ ቀን', formatDate(i.deadline, lang)),
      row('Apply at', 'የሚመለከቱበት ቦታ', i.application_place),
      row('Qualifications', 'መመዘኛዎች', pick(i, 'qualifications'))
    ]
  },
  events: {
    base: '/announcements/events',
    title: ['Events', 'ዝግጅቶች'],
    subtitle: ['Public events and gatherings in Debre Tabor.', 'በደብረ ታቦር የሚካሄዱ ህዝባዊ ዝግጅቶችና ስብሰባዎች።'],
    searchPlaceholder: ['Search events...', 'ዝግጅቶችን ይፈልጉ...'],
    fetchList: fetchEvents, fetchOne: fetchEventById,
    titleField: 'title', summaryField: 'description', bodyField: 'description',
    badge: () => null,
    date: (i, lang) => formatDate(i.event_date, lang),
    imageField: 'image_url',
    facts: (i, lang, pick) => [
      row('Date', 'ቀን', formatDate(i.event_date, lang)),
      row('Time', 'ሰዓት', [formatTime(i.start_time), formatTime(i.end_time)].filter(Boolean).join(' – ')),
      row('Location', 'ቦታ', pick(i, 'location'))
    ]
  },
  notices: {
    base: '/announcements/notices',
    title: ['Public Notices', 'የማስታወቂያ ሰሌዳ'],
    subtitle: ['Active notices for citizens. Expired notices are removed automatically.', 'ለነዋሪዎች የተለቀቁ ወቅታዊ ማስታወቂያዎች። ጊዜያቸው ያለፈ ማስታወቂያዎች በራስ-ሰር ይወገዳሉ።'],
    searchPlaceholder: ['Search notices...', 'ማስታወቂያዎችን ይፈልጉ...'],
    fetchList: fetchNotices, fetchOne: fetchNoticeById,
    titleField: 'title', summaryField: 'notice_body', bodyField: 'notice_body',
    badge: (i) => ({ text: i.priority, tone: i.priority === 'Urgent' ? 'red' : i.priority === 'Important' ? 'amber' : 'gray' }),
    date: (i, lang) => formatDate(i.created_at, lang),
    documentField: 'document_url',
    facts: (i, lang) => [
      row('For', 'ለ', i.target_audience),
      row('Valid until', 'የሚያበቃበት ቀን', formatDate(i.expiry_date, lang))
    ]
  }
};
