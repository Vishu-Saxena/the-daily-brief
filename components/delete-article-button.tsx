'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Trash2 } from 'lucide-react';

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function removeArticle() {
    if (!window.confirm('Delete this published article? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/my-articles/${articleId}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to delete this article.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete this article.');
      setDeleting(false);
    }
  }

  return <div className="mt-4">
    <button type="button" onClick={removeArticle} disabled={deleting} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60" style={{ borderColor: 'var(--line)' }}>
      {deleting ? <LoaderCircle size={15} className="animate-spin"/> : <Trash2 size={15}/>} {deleting ? 'Deleting…' : 'Delete article'}
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}
