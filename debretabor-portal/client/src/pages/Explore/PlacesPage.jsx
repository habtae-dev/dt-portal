import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import useFetch from "../../hooks/useFetch";
import { fetchPlaces, fetchPlaceById, asArray } from "../../api/publicApi";
import { PageShell, DataState, Picture, Prose, T } from "../../components/ui";

// category values are the places ENUM: Park | Monument | Museum
const CATEGORIES = {
  Park: ["Parks", "መናፈሻዎች"],
  Monument: ["Monuments", "ሐውልቶች"],
  Museum: ["Museums", "ሙዚየሞች"],
};

const LIMIT = 6;

export default function PlacesPage({ category, id }) {
  const { lang, pick } = useLanguage();
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  // -------------------------------------------------------------
  // 1. DETAIL VIEW (በ /id ሲገባ - ሙሉ መረጃ እና ሁሉንም ምስሎች ያሳያል)
  // -------------------------------------------------------------
  const detailState = useFetch(
    () => (id ? fetchPlaceById(id) : Promise.resolve(null)),
    [id],
  );

  useEffect(() => {
    setActiveImage(null);
  }, [id]);

  if (id) {
    return (
      <PageShell
        eyebrow={T(lang, "Explore Debre Tabor", "ደብረ ታቦርን ይጎብኙ")}
        title={T(lang, ...(CATEGORIES[category] || ["Explore", "መዳረሻዎች"]))}
      >
        <DataState state={detailState}>
          {(item) => {
            if (!item) return null;
            const images = asArray(item.images);
            const currentImg = activeImage || images[0];
            const itemCategory = item.category || category || "Park";
            const backPath = `/explore/${itemCategory.toLowerCase()}s`; // እንደ ራውተርህ አወቃቀር (ለምሳሌ /places?category=...) ማስተካከል ትችላለህ

            return (
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#004280] hover:underline"
                >
                  ←{" "}
                  {T(
                    lang,
                    `Back to ${CATEGORIES[itemCategory]?.[0] || "Places"}`,
                    `ወደ ${CATEGORIES[itemCategory]?.[1] || "መዳረሻዎች"} ተመለስ`,
                  )}
                </button>

                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#004280]">
                      {T(
                        lang,
                        ...(CATEGORIES[itemCategory] || [
                          itemCategory,
                          itemCategory,
                        ]),
                      )}
                    </span>
                    {pick(item, "location") && (
                      <span className="text-sm text-gray-500">
                        📍 {pick(item, "location")}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-2xl font-bold text-[#003366] sm:text-3xl">
                    {pick(item, "name")}
                  </h1>

                  {/* ዋና ምስል እና Thumbnails (ልክ እንደ News Detail ገጽ) */}
                  {images.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="h-72 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[420px]">
                        <Picture
                          src={currentImg}
                          alt={pick(item, "name")}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {images.map((src) => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => setActiveImage(src)}
                              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                currentImg === src
                                  ? "border-[#003366] opacity-100"
                                  : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                            >
                              <Picture
                                src={src}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ሙሉ መግለጫ */}
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <Prose text={pick(item, "description")} />
                  </div>

                  {/* Google Maps Link */}
                  {item.google_maps_url && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <a
                        href={item.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#004280] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003366]"
                      >
                        📍 {T(lang, "Open in Google Maps", "በጉግል ካርታ ይመልከቱ")} →
                      </a>
                    </div>
                  )}
                </article>
              </div>
            );
          }}
        </DataState>
      </PageShell>
    );
  }

  // -------------------------------------------------------------
  // 2. LIST VIEW (ዋናው ገጽ - 1 Banner Image እና አጭር መግለጫ በ Grid)
  // -------------------------------------------------------------
  useEffect(() => {
    setPage(1);
  }, [category]);

  const state = useFetch(
    () => fetchPlaces({ category, page, limit: LIMIT }),
    [category, page],
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell
      eyebrow={T(lang, "Explore Debre Tabor", "ደብረ ታቦርን ይጎብኙ")}
      title={T(lang, ...CATEGORIES[category])}
    >
      <DataState state={state}>
        {(res) => {
          const items = res?.data || [];
          const total = res?.total || 0;
          const totalPages = Math.ceil(total / LIMIT);

          if (items.length === 0) {
            return (
              <p className="py-12 text-center text-gray-500">
                {T(
                  lang,
                  "No places found in this category.",
                  "በዚህ ምድብ ውስጥ ምንም ቦታ አልተገኘም።",
                )}
              </p>
            );
          }

          return (
            <>
              {/* Grid Layout (1 Banner image ብቻ በእያንዳንዱ ካርድ) */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => {
                  const images = asArray(p.images);
                  const bannerImg = images[0];

                  return (
                    <article
                      key={p.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      {/* 1 Banner Image Only */}
                      <div className="h-48 w-full overflow-hidden bg-gray-100">
                        <Picture
                          src={bannerImg}
                          alt={pick(p, "name")}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#004280]">
                              {T(lang, ...CATEGORIES[category])}
                            </span>
                            {pick(p, "location") && (
                              <span className="truncate text-xs text-gray-500">
                                📍 {pick(p, "location")}
                              </span>
                            )}
                          </div>

                          <h2 className="mt-2 line-clamp-2 text-lg font-bold text-[#003366]">
                            {pick(p, "name")}
                          </h2>

                          <div className="mt-2 line-clamp-3 text-sm text-gray-600">
                            <Prose text={pick(p, "description")} />
                          </div>
                        </div>

                        {/* Read More -> ወደ /places/:id ይወስዳል */}
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <a
                            href={`/explore/${category.toLowerCase()}/${p.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              window.history.pushState(
                                {},
                                "",
                                `/explore/${category.toLowerCase()}/${p.id}`,
                              );
                              window.dispatchEvent(
                                new PopStateEvent("popstate"),
                              );
                            }}
                            className="text-sm font-semibold text-[#004280] hover:underline"
                          >
                            {T(lang, "Read more →", "ተጨማሪ አንብብ →")}
                          </a>
                        </div>

                        
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-6 pt-6">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex h-11 w-16 items-center justify-center rounded-xl bg-[#93b2d0] text-white shadow-sm transition hover:bg-[#7b9ebf] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>

                  <span className="text-base font-bold text-[#003366]">
                    {T(
                      lang,
                      `Page ${page} of ${totalPages}`,
                      `ገጽ ${page} ከ ${totalPages}`,
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-11 w-16 items-center justify-center rounded-xl bg-[#003366] text-white shadow-sm transition hover:bg-[#002244] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          );
        }}
      </DataState>
    </PageShell>
  );
}
