import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchPhotos, asArray, assetUrl } from '../../api/publicApi';
import { PageShell, DataState, Picture, T } from '../../components/ui';

export default function GalleryPage() {
  const { lang, pick } = useLanguage();
  const state = useFetch(fetchPhotos, []);
  const [open, setOpen] = useState(null); // { album, index }
  const album = open && state.data[open.album];
  const imgs = album ? asArray(album.images) : [];

  return (
    <PageShell eyebrow={T(lang, 'Media', 'ሚዲያ')} title={T(lang, 'Photo Gallery', 'የፎቶ ማዕከለ-ስዕላት')}>
      <DataState state={state}>
        {(albums) => (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a, ai) => {
              const images = asArray(a.images);
              return (
                <button key={a.id} onClick={() => setOpen({ album: ai, index: 0 })}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm hover:shadow-md">
                  <Picture src={images[0]} alt={pick(a, 'title')} className="h-52 w-full" />
                  <div className="p-4">
                    <h2 className="font-bold text-[#003366] group-hover:text-[#cc0000]">{pick(a, 'title')}</h2>
                    <p className="text-xs text-gray-500">{a.category} · {images.length} {T(lang, 'photos', 'ፎቶዎች')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DataState>

      {album && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <img src={assetUrl(imgs[open.index])} alt={pick(album, 'title')} className="max-h-[80vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="mt-4 flex items-center gap-4 text-white" onClick={(e) => e.stopPropagation()}>
            <button disabled={open.index === 0} onClick={() => setOpen({ ...open, index: open.index - 1 })} className="rounded bg-white/20 px-4 py-2 disabled:opacity-30">←</button>
            <span className="text-sm">{open.index + 1} / {imgs.length} · {pick(album, 'title')}</span>
            <button disabled={open.index >= imgs.length - 1} onClick={() => setOpen({ ...open, index: open.index + 1 })} className="rounded bg-white/20 px-4 py-2 disabled:opacity-30">→</button>
            <button onClick={() => setOpen(null)} className="rounded bg-white/20 px-4 py-2">✕</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
