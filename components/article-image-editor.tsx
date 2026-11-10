'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, LoaderCircle } from 'lucide-react';

export function ArticleImageEditor({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function upload() {
    if (!file) return;
    setSaving(true); setError('');
    try {
      const form = new FormData(); form.append('image', file);
      const response = await fetch(`/api/my-articles/${articleId}/image`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not upload the image.');
      setFile(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not upload the image.'); }
    finally { setSaving(false); }
  }

  return <div className="mt-4 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'var(--line)' }}><ImagePlus size={16}/>{file ? file.name : 'Add or replace image'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => { const selected = event.target.files?.[0] || null; setError(selected && selected.size > 5 * 1024 * 1024 ? 'Image must be 5 MB or smaller.' : ''); setFile(selected && selected.size <= 5 * 1024 * 1024 ? selected : null); }}/></label>{file&&<button onClick={upload} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60">{saving?<LoaderCircle size={15} className="animate-spin"/>:<ImagePlus size={15}/>} Save image</button>}{error&&<span role="alert" className="basis-full text-sm text-red-700">{error}</span>}</div>;
}
