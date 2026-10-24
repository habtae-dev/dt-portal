// components/AnnouncementsPanel.jsx
// Active, non-expired announcements from GET /api/announcements. Sits above
// the Latest News grid on the homepage — announcements are shorter, more
// time-sensitive notices (deadlines, closures) rather than full articles.

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { fetchNotices } from "../api/publicApi";

export default function AnnouncementsPanel() {
  const { lang, pick } = useLanguage();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    fetchNotices()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing active to show and nothing went wrong — don't take up space
  // with an empty section on the homepage.
  if (status === "ready" && items.length === 0) return null;
  if (status === "loading" || status === "error") return null;

  return (
    <section className="bg-[#fff8e6] border-y border-amber-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-700">
            {lang === "am" ? "ማስታወቂያዎች" : "Announcements"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {a.target_audience}
                </span>
                {a.expiry_date && (
                  <span className="text-[11px] text-gray-500">
                    {lang === "am" ? "እስከ" : "Until"}{" "}
                    {new Date(a.expiry_date).toLocaleDateString(lang === "am" ? "am-ET" : "en-US")}
                  </span>
                )}
              </div>
              <Link to={`/announcements/notices/${a.id}`} className="block text-sm font-bold text-[#003366] hover:text-[#cc0000] mb-1">{pick(a, "title")}</Link>
              <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">{pick(a, "notice_body")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
