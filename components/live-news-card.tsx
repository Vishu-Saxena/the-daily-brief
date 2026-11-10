import { ArrowUpRight } from 'lucide-react';
import type { LiveHeadline } from '@/lib/news';

export function LiveNewsCard({ story }: { story: LiveHeadline }) {
  const date = story.publishedAt ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(story.publishedAt)) : '';
  return <article className="card flex h-full flex-col">
    {story.imageUrl ? <a href={story.url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${story.title} at ${story.source}`}><img src={story.imageUrl} alt="" loading="lazy" className="image aspect-[16/10]"/></a> : null}
    <div className="flex flex-1 flex-col p-5">
      <div className="eyebrow mb-3">{story.source}</div>
      <h3 className="serif text-xl font-bold leading-tight">{story.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6" style={{color:'var(--muted)'}}>{story.description}</p>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs" style={{color:'var(--muted)'}}><span>{date}</span><a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)]">Read at source <ArrowUpRight size={14}/></a></div>
    </div>
  </article>;
}
