import { Routes, Route } from 'react-router-dom';
import MegaMenuHeader from './components/MegaMenuHeader';
import AccessibilityBar from './components/AccessibilityBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchResults from './pages/Search/SearchResults';
import Unsubscribe from './pages/Unsubscribe';

import History from './pages/About/History';
import Community from './pages/About/Community';
import Geography from './pages/About/Geography';
import CityAdministration from './pages/About/CityAdministration';

import ExecutivePage from './pages/Government/ExecutivePage';
import SubCitiesPage from './pages/Government/SubCitiesPage';
import CouncilPage from './pages/Council/CouncilPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import ServicesPage from './pages/Services/ServicesPage';
import PlacesPage from './pages/Explore/PlacesPage';
import DoingBusinessPage from './pages/Explore/DoingBusinessPage';
import GalleryPage from './pages/Media/GalleryPage';
import VideosPage from './pages/Media/VideosPage';
import AnnouncementsPage from './pages/Announcements/AnnouncementsPage';
import AnnouncementDetail from './pages/Announcements/AnnouncementDetail';

// Every route below is a thin binding of a URL to a data-driven page. The values passed as props are the
// ENUM values of the matching database column (executive_contents.category, council_contents.subcategory,
// places.category, projects.category), so the page asks the API for exactly that slice.
const ROUTES = [
  ['/', <Home key="home" />],
  ['/search', <SearchResults key="search" />],
  ['/unsubscribe/:token', <Unsubscribe key="unsub" />],

  ['/about/history', <History key="h" />],
  ['/about/community', <Community key="c" />],
  ['/about/geography', <Geography key="g" />],
  ['/about/administration', <CityAdministration key="a" />],

  ['/gov/mayors', <ExecutivePage key="mayor" category="mayor" />],
  ['/gov/cabinet', <ExecutivePage key="cabinet" category="cabinet" />],
  ['/gov/structure', <ExecutivePage key="structure" category="structure" />],
  ['/gov/bureau', <ExecutivePage key="bureau" category="bureau" />],
  ['/gov/subcity', <SubCitiesPage key="subcity" />],

  ['/council/overview', <CouncilPage key="co" subcategory="overview" />],
  ['/council/structure', <CouncilPage key="cs" subcategory="structure" />],
  ['/council/speaker', <CouncilPage key="csp" subcategory="speaker" />],
  ['/council/committees', <CouncilPage key="cc" subcategory="standing_committees" />],

  ['/projects/programs', <ProjectsPage key="prog" category="Program" />],
  ['/projects/projects', <ProjectsPage key="proj" category="Project" />],

  ['/services/online', <ServicesPage key="services" />],

  ['/explore/park', <PlacesPage key="park" category="Park" />],
  ['/explore/monument', <PlacesPage key="monument" category="Monument" />],
  ['/explore/museum', <PlacesPage key="museum" category="Museum" />],
  ['/explore/business', <DoingBusinessPage key="business" />],

  ['/resources/media/gallery', <GalleryPage key="gallery" />],
  ['/resources/media/video', <VideosPage key="video" />],

  ['/announcements/news', <AnnouncementsPage key="ln" type="news" />],
  ['/announcements/news/:id', <AnnouncementDetail key="dn" type="news" />],
  ['/announcements/tender', <AnnouncementsPage key="lt" type="tenders" />],
  ['/announcements/tender/:id', <AnnouncementDetail key="dt" type="tenders" />],
  ['/announcements/vacancy', <AnnouncementsPage key="lv" type="vacancies" />],
  ['/announcements/vacancy/:id', <AnnouncementDetail key="dv" type="vacancies" />],
  ['/announcements/events', <AnnouncementsPage key="le" type="events" />],
  ['/announcements/events/:id', <AnnouncementDetail key="de" type="events" />],
  ['/announcements/notices', <AnnouncementsPage key="lno" type="notices" />],
  ['/announcements/notices/:id', <AnnouncementDetail key="dno" type="notices" />]
];

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AccessibilityBar />
      <MegaMenuHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {ROUTES.map(([path, element]) => <Route key={path} path={path} element={<PublicLayout>{element}</PublicLayout>} />)}
      <Route path="*" element={<PublicLayout><div className="p-10 text-center text-xl font-bold">404 - Page Not Found</div></PublicLayout>} />
    </Routes>
  );
}
