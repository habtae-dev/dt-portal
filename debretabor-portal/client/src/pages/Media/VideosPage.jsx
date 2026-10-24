import { useLanguage } from '../../context/LanguageContext';
import useFetch from '../../hooks/useFetch';
import { fetchVideos, assetUrl } from '../../api/publicApi';
import { PageShell, DataState, Prose, T } from '../../components/ui';

// video_url is either an uploaded file (/uploads/...) or an external link (e.g. YouTube).
function youtubeEmbed(url) {
  const m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url || '');
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function Player({ video, title }) {
  const embed = youtubeEmbed(video.video_url);
  if (embed) return <iframe src={embed} title={title} className="aspect-video w-full" allowFullScreen loading="lazy" />;
  if (/\.(mp4|webm|mov|mkv|avi)$/i.test(video.video_url)) {
    return <video src={assetUrl(video.video_url)} poster={assetUrl(video.thumbnail_url) || undefined} controls preload="metadata" className="aspect-video w-full bg-black" />;
  }
  return <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center bg-gray-900 text-white underline">▶ {title}</a>;
}

export default function VideosPage() {
  const { lang, pick } = useLanguage();
  const state = useFetch(fetchVideos, []);
  return (
    <PageShell eyebrow={T(lang, 'Media', 'ሚዲያ')} title={T(lang, 'Videos', 'ቪዲዮዎች')}>
      <DataState state={state}>
        {(videos) => (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((v) => (
              <article key={v.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Player video={v} title={pick(v, 'title')} />
                <div className="p-4">
                  <h2 className="font-bold text-[#003366]">{pick(v, 'title')}</h2>
                  <Prose text={pick(v, 'description')} />
                </div>
              </article>
            ))}
          </div>
        )}
      </DataState>
    </PageShell>
  );
}
