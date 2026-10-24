// components/LatestNews.jsx
// Latest News section for the homepage — fetches real published articles
// from GET /api/news?limit=&page= and supports "Load More" instead of a
// full page reload. Falls back to a styled gradient banner when an article
// has no image_url, matching the original design.

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { fetchNewsPage, asArray, assetUrl } from "../api/publicApi";
import { T } from "./ui";

const PAGE_SIZE = 6;

export default function LatestNews() {
  const { lang, pick } = useLanguage();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error | loadingMore
  const [errorMsg, setErrorMsg] = useState("");

  const loadPage = useCallback(async (pageNum, append) => {
    setStatus(append ? "loadingMore" : "loading");
    setErrorMsg("");
    try {
      const { data, total } = await fetchNewsPage({ page: pageNum, limit: PAGE_SIZE });
      setItems((prev) => (append ? [...prev, ...data] : data));
      setHasMore(pageNum * PAGE_SIZE < total);
      setPage(pageNum);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Could not load news right now.");
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString(lang === "am" ? "am-ET" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <section className="py-14 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-[#cc0000] font-bold text-xs uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
              {lang === "am" ? "የቅርብ ጊዜ መረጃዎች" : "Latest Updates"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#004280] mt-2 tracking-tight">
              {lang === "am" ? "ዜናዎች እና ማስታወቂያዎች" : "News & Announcements"}
            </h2>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              to="/announcements/news"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#004280] hover:text-[#cc0000] transition-colors"
            >
              <span>{lang === "am" ? "ሁሉንም ይመልከቱ" : "View All News"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Loading skeleton (first load only) */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Empty state */}
        {status !== "loading" && status !== "error" && items.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            {lang === "am" ? "እስካሁን የታተመ ዜና የለም።" : "No published news yet."}
          </div>
        )}

        {/* News Cards Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col group"
              >
                {/* Image / Header Banner Container with Conditional Image Rendering */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#003366] to-[#004280] flex items-center justify-center text-white">
                  {asArray(item.images)[0] ? (
                    <>
                      <img
                        src={assetUrl(asArray(item.images)[0])}
                        alt={pick(item, "title")}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                      <span className="relative z-10 font-bold text-base line-clamp-2 px-6 text-center group-hover:scale-105 transition-transform duration-300">
                        {item.category || T(lang, 'News', 'ዜና')}
                      </span>
                    </>
                  )}

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 z-20 bg-[#cc0000] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
                    {item.category}
                  </span>

                  {/* Date */}
                  <span className="absolute bottom-3 left-3 z-20 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Content Container */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-2.5 group-hover:text-[#004280] transition-colors line-clamp-2 leading-snug">
                      {pick(item, "title")}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
                      {pick(item, "content")}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={`/announcements/news/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004280] group-hover:text-[#cc0000] transition-colors uppercase tracking-wider"
                    >
                      <span>{lang === "am" ? "ተጨማሪ አንብብ" : "Read More"}</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => loadPage(page + 1, true)}
              disabled={status === "loadingMore"}
              className="rounded-lg border-2 border-[#004280] px-8 py-3 text-sm font-bold text-[#004280] uppercase tracking-wide transition-colors hover:bg-[#004280] hover:text-white disabled:opacity-60"
            >
              {status === "loadingMore"
                ? (lang === "am" ? "በመጫን ላይ…" : "Loading…")
                : (lang === "am" ? "ተጨማሪ ይመልከቱ" : "Load more")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
