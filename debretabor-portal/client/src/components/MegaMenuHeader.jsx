// components/public/MegaMenuHeader.jsx
// AAU-Style Full-Width Navigation & Search for Debre Tabor City Administration

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import logo from '../assets/logo.jpg';

const MUNICIPAL_NAV = {
  en: [
    { label: "HOME", href: "/", key: "home" },
    {
      label: "ABOUT",
      key: "about",
      dropdown: [
        { name: "History", href: "/about/history" },
        { name: "Community", href: "/about/community" },
        { name: "Geography", href: "/about/geography" },
        { name: "City Administration", href: "/about/administration" },
      ],
    },
    {
      label: "GOVERNMENT",
      key: "government",
      dropdown: [
        { name: "Cabinet", href: "/gov/cabinet" },
        { name: "Mayors", href: "/gov/mayors" },
        { name: "Structure", href: "/gov/structure" },
        { name: "Sub City", href: "/gov/subcity" },
        { name: "Bureau", href: "/gov/bureau" },
      ],
    },
    {
      label: "COUNCIL",
      key: "council",
      dropdown: [
        { name: "Overview", href: "/council/overview" },
        { name: "Administrative Structure", href: "/council/structure" },
        { name: "Speaker", href: "/council/speaker" },
        { name: "Standing Committees", href: "/council/committees" },
      ],
    },
    {
      label: "PROJECTS",
      key: "projects",
      dropdown: [
        { name: "Programs", href: "/projects/programs" },
        { name: "Projects", href: "/projects/projects" },
      ],
    },
    {
      label: "SERVICES",
      key: "services",
      dropdown: [{ name: "Online Services", href: "/services/online" }],
    },
    {
      label: "EXPLORE",
      key: "explore",
      dropdown: [
        { name: "Park", href: "/explore/park" },
        { name: "Monument", href: "/explore/monument" },
        { name: "Museum", href: "/explore/museum" },
        { name: "Doing Business", href: "/explore/business" },
      ],
    },
    {
      label: "RESOURCES",
      key: "resources",
      hasSub: true,
      dropdown: [
        {
          name: "Media",
          sub: [
            { name: "Gallery", href: "/resources/media/gallery" },
            { name: "Video", href: "/resources/media/video" },
          ],
        },
      ],
    },
    {
      label: "ANNOUNCEMENTS",
      key: "announcements",
      dropdown: [
        { name: "News", href: "/announcements/news" },
        { name: "Noticeboard", href: "/announcements/notices" },
        { name: "Tender", href: "/announcements/tender" },
        { name: "Vacancy", href: "/announcements/vacancy" },
        { name: "Events", href: "/announcements/events" },
      ],
    },
  ],
  am: [
    { label: "መነሻ", href: "/", key: "home" },
    {
      label: "ከተማ",
      key: "about",
      dropdown: [
        { name: "ታሪክ", href: "/about/history" },
        { name: "ማህበረሰብ", href: "/about/community" },
        { name: "ጂኦግራፊ", href: "/about/geography" },
        { name: "ከተማ አስተዳደር", href: "/about/administration" },
      ],
    },
    {
      label: "መንግስት",
      key: "government",
      dropdown: [
        { name: "ካቢኔ", href: "/gov/cabinet" },
        { name: "ከንቲባዎች", href: "/gov/mayors" },
        { name: "መዋቅር", href: "/gov/structure" },
        { name: "ክፍለ ከተማ", href: "/gov/subcity" },
        { name: "ቢሮ", href: "/gov/bureau" },
      ],
    },
    {
      label: "ምክር ቤት",
      key: "council",
      dropdown: [
        { name: "ጠቅላላ እይታ", href: "/council/overview" },
        { name: "የአስተዳደር መዋቅር", href: "/council/structure" },
        { name: "አፈ-ጉባኤ", href: "/council/speaker" },
        { name: "ቋሚ ኮሚቴዎች", href: "/council/committees" },
      ],
    },
    {
      label: "ፕሮጀክቶች",
      key: "projects",
      dropdown: [
        { name: "ፕሮግራሞች", href: "/projects/programs" },
        { name: "ፕሮጀክቶች", href: "/projects/projects" },
      ],
    },
    {
      label: "አገልግሎቶች",
      key: "services",
      dropdown: [{ name: "የኦንላይን አገልግሎቶች", href: "/services/online" }],
    },
    {
      label: "ዳሰሳ",
      key: "explore",
      dropdown: [
        { name: "ፓርክ", href: "/explore/park" },
        { name: "ሀውልት", href: "/explore/monument" },
        { name: "ቤተ መዘክር", href: "/explore/museum" },
        { name: "ንግድ", href: "/explore/business" },
      ],
    },
    {
      label: "ሀብቶች",
      key: "resources",
      hasSub: true,
      dropdown: [
        {
          name: "ሚዲያ",
          sub: [
            { name: "ማዕከለ-ስዕላት", href: "/resources/media/gallery" },
            { name: "ቪዲዮ", href: "/resources/media/video" },
          ],
        },
      ],
    },
    {
      label: "ማስታወቂያዎች",
      key: "announcements",
      dropdown: [
        { name: "ዜና", href: "/announcements/news" },
        { name: "ማስታወቂያ ሰሌዳ", href: "/announcements/notices" },
        { name: "ጨረታ", href: "/announcements/tender" },
        { name: "ክፍት የስራ ቦታ", href: "/announcements/vacancy" },
        { name: "ኩነቶች", href: "/announcements/events" },
      ],
    },
  ],
};

export default function MegaMenuHeader() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState(null);
  const [mobileExpandedSub, setMobileExpandedSub] = useState(null);

  // Search Expand States (AAU Style)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const navItems = MUNICIPAL_NAV[lang] || MUNICIPAL_NAV.en;

  const toggleMobileMenu = (key) => {
    setMobileExpandedMenu(mobileExpandedMenu === key ? null : key);
    setMobileExpandedSub(null);
  };

  const toggleMobileSub = (name) => {
    setMobileExpandedSub(mobileExpandedSub === name ? null : name);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isItemActive = (item) => {
    if (item.href && location.pathname === item.href) return true;
    if (item.dropdown) {
      return item.dropdown.some((drop) => {
        if (drop.href && location.pathname === drop.href) return true;
        if (drop.sub) {
          return drop.sub.some((sub) => sub.href === location.pathname);
        }
        return false;
      });
    }
    return false;
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md w-full border-b border-gray-200">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 relative">
        <div className="flex justify-between items-center h-[75px] lg:h-[85px]">
          {/* Left: Brand & Logo Section */}
          <Link to="/" className="flex items-center group flex-shrink-0 mr-2">
            <img
              src={logo}
              alt="Debre Tabor City Logo"
              className="h-[40px] lg:h-[50px] w-auto mr-2.5 object-contain"
            />
            <div className="h-[40px] w-[2px] bg-[#004280] mr-2.5 hidden sm:block"></div>
            <div className="flex flex-col justify-center hidden sm:flex">
              <span className="text-[#004280] font-bold text-[11px] lg:text-[13px] leading-tight font-sans tracking-wide">
                የደብረ ታቦር ከተማ አስተዳደር
              </span>
              <span className="text-[#cc0000] font-semibold text-[10px] lg:text-[11px] leading-[1.2] uppercase font-sans mt-0.5">
                Debre Tabor City Administration
              </span>
              <span className="text-gray-500 font-medium text-[8px] lg:text-[9px] tracking-wider mt-0.5 uppercase">
                Official Portal
              </span>
            </div>
          </Link>

          {/* Right: Main Navigation Section */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center space-x-0 xl:space-x-1">
              {navItems.map((item, index) => {
                const active = isItemActive(item);
                const isLastOrSecondLast = index >= navItems.length - 2;

                return (
                  <li
                    key={item.key}
                    className="relative group py-6"
                    onMouseEnter={() => setActiveMenu(item.key)}
                    onMouseLeave={() => {
                      setActiveMenu(null);
                      setActiveSubMenu(null);
                    }}
                  >
                    {item.dropdown ? (
                      <button
                        className={`flex items-center gap-0.5 px-2 py-2 text-[10px] xl:text-[12px] font-bold transition-colors uppercase tracking-tight cursor-default whitespace-nowrap rounded-sm ${
                          active || activeMenu === item.key
                            ? "text-[#004280] bg-blue-50/60"
                            : "text-gray-700 hover:text-[#004280] hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                        <svg
                          className={`w-3 h-3 transition-transform ${activeMenu === item.key ? "rotate-180 text-[#004280]" : "text-gray-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className={`flex items-center gap-1 px-2 py-2 text-[10px] xl:text-[12px] font-bold transition-colors uppercase tracking-tight whitespace-nowrap rounded-sm ${
                          active
                            ? "text-[#004280] bg-blue-50/60"
                            : "text-gray-700 hover:text-[#004280] hover:bg-gray-50"
                        }`}
                      >
                        {item.key === "home" ? (
                          <svg
                            className={`w-4 h-4 ${active ? "text-[#004280]" : "text-gray-600"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        ) : (
                          item.label
                        )}
                      </Link>
                    )}

                    {/* Active/Hover Bottom Indicator Line */}
                    {(active || activeMenu === item.key) && (
                      <span className="absolute bottom-3 left-2 right-2 h-[3px] bg-[#004280] rounded-full transition-all"></span>
                    )}

                    {/* Level 1 Dropdown */}
                    {item.dropdown && activeMenu === item.key && (
                      <div className={`absolute ${isLastOrSecondLast ? 'right-0' : 'left-0'} top-full w-[260px] bg-white shadow-2xl border-t-2 border-[#004280] rounded-b-md py-2 z-[999]`}>
                        {item.dropdown.map((dropItem, idx) => (
                          <div key={idx} className="border-b border-gray-100 last:border-none relative">
                            {dropItem.sub ? (
                              <div
                                onMouseEnter={() => setActiveSubMenu(idx)}
                                onMouseLeave={() => setActiveSubMenu(null)}
                              >
                                <button
                                  type="button"
                                  aria-haspopup="true"
                                  aria-expanded={activeSubMenu === idx}
                                  onClick={() => setActiveSubMenu(activeSubMenu === idx ? null : idx)}
                                  onFocus={() => setActiveSubMenu(idx)}
                                  className={`flex justify-between items-center w-full px-4 py-2.5 text-[12px] transition-all font-semibold ${
                                    activeSubMenu === idx 
                                      ? 'bg-blue-50 text-[#004280]' 
                                      : 'text-gray-900 hover:bg-gray-50 hover:text-[#004280]'
                                  }`}
                                >
                                  <span>{dropItem.name}</span>
                                  <svg 
                                    className={`w-3.5 h-3.5 text-gray-500 ${isLastOrSecondLast ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>

                                {/* Side-by-side Submenu Box */}
                                {activeSubMenu === idx && (
                                  <div className={`absolute top-0 ${isLastOrSecondLast ? 'right-full -mr-px' : 'left-full -ml-px'} w-[240px] bg-white shadow-2xl border border-gray-200 rounded-md py-2 z-[1000]`}>
                                    <div className="px-4 py-1.5 text-[11px] font-bold text-[#004280] border-b border-gray-100 uppercase tracking-wide">
                                      {dropItem.name}
                                    </div>
                                    <div className="py-1">
                                      {dropItem.sub.map((subItem, sIdx) => (
                                        <Link 
                                          key={sIdx}
                                          to={subItem.href}
                                          className={`block px-4 py-2 text-[12px] transition-colors ${
                                            location.pathname === subItem.href 
                                              ? 'bg-red-50 text-[#cc0000] font-semibold border-l-4 border-[#cc0000]' 
                                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#004280]'
                                          }`}
                                        >
                                          {subItem.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link 
                                to={dropItem.href}
                                className={`flex justify-between items-center px-4 py-2.5 text-[12px] transition-all ${
                                  location.pathname === dropItem.href 
                                    ? 'bg-blue-50 text-[#004280] font-semibold border-l-4 border-[#004280]' 
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#004280]'
                                }`}
                              >
                                {dropItem.name}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Language & Search Actions */}
            <div className="flex items-center ml-2 pl-2 border-l border-gray-300 gap-2">
              <button
                onClick={toggleLang}
                className="text-[11px] font-bold text-[#004280] hover:bg-[#004280] hover:text-white transition-colors border-2 border-[#004280] px-1.5 py-0.5 rounded-sm"
              >
                {lang === "en" ? "አማ" : "EN"}
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="text-gray-500 hover:text-[#004280] transition-colors p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile / Tablet Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="text-gray-500 hover:text-[#004280] transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              onClick={toggleLang}
              className="text-xs font-bold text-[#004280] border-2 border-[#004280] px-2 py-1 rounded-sm"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 text-[#004280] hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* AAU-Style Full-Width Expandable Search Bar */}
        {/* ========================================== */}
        {searchOpen && (
          <div className="absolute inset-0 bg-white z-[100] flex items-center px-4 lg:px-6 w-full h-full animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center justify-between gap-3">
              {/* Home / Back Icon Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  navigate('/');
                }}
                className="text-gray-600 hover:text-[#004280] p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Go to home"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>

              {/* Search Input Bar */}
              <div className="flex-1 flex items-center bg-transparent border-b-2 border-[#004280] px-2 py-1">
                <svg className="w-5 h-5 text-[#004280] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'am' ? 'በደብረ ታቦር ከተማ ፖርታል ይፈልጉ (ለምሳሌ ከንቲባ፣ ጨረታ)...' : 'Search Debre Tabor City Portal (e.g., Mayor, Tender)...'}
                  className="w-full text-lg lg:text-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                  autoFocus
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-500 hover:text-[#cc0000] p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden bg-[#004280] ${mobileMenuOpen ? "max-h-[85vh] overflow-y-auto" : "max-h-0"}`}
      >
        <ul className="flex flex-col text-white divide-y divide-[#005299]">
          {navItems.map((item) => (
            <li key={item.key}>
              <div className="flex justify-between items-center hover:bg-[#003366] transition-colors">
                {item.dropdown ? (
                  <button
                    onClick={() => toggleMobileMenu(item.key)}
                    className="flex justify-between items-center w-full px-4 py-3 font-semibold uppercase tracking-wide text-[14px]"
                  >
                    <span>{item.label}</span>
                    <svg
                      className={`h-5 w-5 transition-transform ${mobileExpandedMenu === item.key ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 font-semibold uppercase tracking-wide text-[14px]"
                  >
                    {item.label}
                  </Link>
                )}
              </div>

              {/* Mobile Dropdown Items */}
              {item.dropdown && mobileExpandedMenu === item.key && (
                <ul className="bg-[#003366] py-2 pl-4 pr-2 divide-y divide-[#004280]">
                  {item.dropdown.map((dropItem, dIdx) => (
                    <li key={dIdx} className="py-1">
                      {dropItem.sub ? (
                        <div>
                          <button
                            onClick={() => toggleMobileSub(dropItem.name)}
                            className="flex justify-between items-center w-full py-2 text-[13px] text-gray-200 font-medium"
                          >
                            <span>{dropItem.name}</span>
                            <svg
                              className={`h-4 w-4 transition-transform ${mobileExpandedSub === dropItem.name ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {mobileExpandedSub === dropItem.name && (
                            <ul className="pl-3 py-1 space-y-1 border-l-2 border-[#cc0000] my-1">
                              {dropItem.sub.map((subItem, sIdx) => (
                                <li key={sIdx}>
                                  <Link
                                    to={subItem.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-1.5 text-[12px] text-gray-300 hover:text-white"
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={dropItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-[13px] text-gray-200 hover:text-white"
                        >
                          {dropItem.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}