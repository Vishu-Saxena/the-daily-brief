'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, LoaderCircle, Plus, Send, Trash2 } from 'lucide-react';
import { categories } from '@/lib/data';

type EditableSection = { heading: string; paragraphs: string[] };
type PreparedArticle = { title: string; dek: string; category: string; sections: EditableSection[] };
type ArticleSource = { title: string; url: string };

export function PublishArticleForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'topic'>('manual');
  const [draft, setDraft] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [prepared, setPrepared] = useState<PreparedArticle | null>(null);
  const [sources, setSources] = useState<ArticleSource[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!image) { setImagePreview(''); return; }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function prepareArticle(event: React.FormEvent) {
    event.preventDefault(); setPreparing(true); setError('');
    try {
      const endpoint = mode === 'topic' ? '/api/ai/write-from-topic' : '/api/ai/prepare-article';
      const payload = mode === 'topic' ? { topic } : { draft };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not prepare the article.');
      setPrepared(data.article); setSources(data.sources ?? []); setSearched(Boolean(data.searched));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not prepare the article.'); }
    finally { setPreparing(false); }
  }

  async function publishArticle() {
    if (!prepared) return;
    setPublishing(true); setError('');
    try {
      const form = new FormData();
      form.append('article', JSON.stringify(prepared));
      form.append('imageAttached', String(Boolean(image)));
      if (image) form.append('image', image);
      const response = await fetch('/api/my-articles', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not publish the article.');
      router.push('/dashboard?published=1'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not publish the article.'); setPublishing(false); }
  }

  function updateSection(index: number, values: Partial<EditableSection>) {
    setPrepared(current => current ? { ...current, sections: current.sections.map((section, i) => i === index ? { ...section, ...values } : section) } : current);
  }

  function imagePicker(id: string) {
    return <div className="mt-7 rounded border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="flex flex-wrap items-center justify-between gap-4"><div><label htmlFor={id} className="text-sm font-semibold">Article image <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span></label><p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Choose your own JPEG, PNG, or WebP image, up to 5 MB.</p></div><div className="flex items-center gap-3"><input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file && file.size > 5 * 1024 * 1024) { setError('Image must be 5 MB or smaller.'); event.target.value = ''; return; } setError(''); setImage(file || null); }} className="max-w-[230px] text-xs"/>{image && <button type="button" onClick={() => setImage(null)} className="text-xs underline">Remove</button>}</div></div>{imagePreview && <img src={imagePreview} alt="Selected article image preview" className="mt-4 max-h-72 w-full rounded object-cover"/>}</div>;
  }

  if (prepared) return <div className="mt-10">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--line)' }}><div><div className="eyebrow">AI prepared draft · editable</div><h2 className="serif mt-2 text-3xl font-bold">Review your story</h2></div><button type="button" onClick={() => setPrepared(null)} className="flex items-center gap-2 text-sm underline underline-offset-4"><ArrowLeft size={16}/> Back to draft</button></div>
    <div className="mx-auto max-w-3xl">
      {mode === 'topic' && <div className="mb-6 rounded border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><p className="text-sm">{searched ? 'The AI searched the web for this draft. Review sources and verify details before publishing.' : 'The AI used its existing knowledge; web search was not used for this draft.'}</p>{sources.length > 0 && <ul className="mt-3 list-inside list-disc space-y-1 text-sm">{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">{source.title}</a></li>)}</ul>}</div>}
      <label className="eyebrow" htmlFor="article-title">Headline</label><input id="article-title" value={prepared.title} maxLength={180} onChange={event => setPrepared({ ...prepared, title: event.target.value })} className="serif mt-2 w-full border-b bg-transparent pb-4 text-3xl font-bold leading-tight outline-none focus:border-[var(--accent)] md:text-5xl" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}/>
      <label className="mt-7 block text-xs font-semibold uppercase tracking-[.14em]" htmlFor="article-dek" style={{ color: 'var(--muted)' }}>Article summary</label><textarea id="article-dek" value={prepared.dek} maxLength={400} rows={3} onChange={event => setPrepared({ ...prepared, dek: event.target.value })} className="mt-2 w-full resize-y rounded border bg-transparent p-3 text-base leading-7 outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)' }}/>
      {imagePicker('article-image-edit')}
      <label className="mt-6 block text-xs font-semibold uppercase tracking-[.14em]" htmlFor="article-category" style={{ color: 'var(--muted)' }}>Category</label><select id="article-category" value={prepared.category} onChange={event => setPrepared({ ...prepared, category: event.target.value })} className="mt-2 rounded border bg-[var(--surface)] px-4 py-3" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>{categories.map(category => <option key={category}>{category}</option>)}</select>
      <div className="prose prose-lg mt-10 max-w-none">{prepared.sections.map((section, index) => <section key={index} className="not-prose mb-8 rounded border p-5" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="mb-4 flex items-center gap-3"><input aria-label={`Section ${index + 1} heading`} value={section.heading} maxLength={160} onChange={event => updateSection(index, { heading: event.target.value })} className="serif min-w-0 flex-1 border-b bg-transparent pb-2 text-2xl font-bold outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}/><button type="button" aria-label="Remove section" onClick={() => setPrepared({ ...prepared, sections: prepared.sections.filter((_, i) => i !== index) })} disabled={prepared.sections.length <= 1} className="rounded p-2 text-[var(--muted)] hover:text-red-700 disabled:opacity-30"><Trash2 size={17}/></button></div><textarea aria-label={`Text for ${section.heading || `section ${index + 1}`}`} value={section.paragraphs.join('\n\n')} onChange={event => updateSection(index, { paragraphs: event.target.value.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean) })} rows={Math.max(6, section.paragraphs.join('\n\n').split('\n').length + 2)} className="w-full resize-y bg-transparent text-base leading-8 outline-none" style={{ color: 'var(--ink)' }}/></section>)}</div>
      <button type="button" onClick={() => setPrepared({ ...prepared, sections: [...prepared.sections, { heading: 'New section', paragraphs: [''] }] })} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'var(--line)' }}><Plus size={16}/> Add section</button>
      {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: 'var(--line)' }}><p className="max-w-lg text-sm leading-6" style={{ color: 'var(--muted)' }}>Publishing makes this article visible to readers and adds it to your My Posts page.</p><button type="button" onClick={publishArticle} disabled={publishing} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white disabled:opacity-60">{publishing ? <LoaderCircle className="animate-spin" size={17}/> : <Send size={16}/>} {publishing ? 'Publishing…' : 'Publish article'}</button></div>
    </div>
  </div>;

  return <form onSubmit={prepareArticle} className="mt-10 max-w-3xl">
    <div className="mb-6 flex flex-wrap gap-3" role="tablist" aria-label="Article creation method"><button type="button" role="tab" aria-selected={mode === 'manual'} onClick={() => setMode('manual')} className={`rounded-full border px-5 py-2 text-sm ${mode === 'manual' ? 'bg-[var(--accent)] text-white' : ''}`} style={{ borderColor: 'var(--line)' }}>Write manually</button><button type="button" role="tab" aria-selected={mode === 'topic'} onClick={() => setMode('topic')} className={`rounded-full border px-5 py-2 text-sm ${mode === 'topic' ? 'bg-[var(--accent)] text-white' : ''}`} style={{ borderColor: 'var(--line)' }}>Generate from a topic</button></div>
    {mode === 'manual' ? <><label htmlFor="article-draft" className="eyebrow">Your article draft</label><p className="mb-4 mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>Write your complete article in your own words. AI will suggest a headline, category, summary, and structure based only on your draft. You can edit everything before publishing.</p><textarea id="article-draft" required minLength={250} maxLength={30000} value={draft} onChange={event => setDraft(event.target.value)} rows={16} placeholder="Start writing your article here…" className="w-full resize-y rounded border bg-[var(--surface)] p-5 text-base leading-7 outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}/><div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}><span>At least 250 characters · maximum 30,000</span><span>{draft.length.toLocaleString()} / 30,000</span></div>{imagePicker('article-image')}</> : <><label htmlFor="article-topic" className="eyebrow">What should the article be about?</label><p className="mb-4 mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>Enter a topic. AI will search the web when it needs reliable or current information, then prepare a structured article you can edit before publishing.</p><textarea id="article-topic" required minLength={5} maxLength={500} value={topic} onChange={event => setTopic(event.target.value)} rows={5} placeholder="For example: How urban gardens are changing food access in Indian cities" className="w-full resize-y rounded border bg-[var(--surface)] p-5 text-base leading-7 outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}/></>}
    {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
    <button type="submit" disabled={preparing || (mode === 'manual' ? draft.trim().length < 250 : topic.trim().length < 5)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white disabled:opacity-50">{preparing ? <LoaderCircle className="animate-spin" size={17}/> : <ArrowRight size={17}/>} {preparing ? (mode === 'topic' ? 'Researching and writing…' : 'Preparing your article…') : (mode === 'topic' ? 'Generate article with AI' : 'Prepare article with AI')}</button>
  </form>;
}
