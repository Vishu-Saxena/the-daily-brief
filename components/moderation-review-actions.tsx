'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, LoaderCircle, X } from 'lucide-react';

export function ModerationReviewActions({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function decide(decision: 'publish' | 'reject') {
    setSaving(true); setError('');
    try {
      const response = await fetch(`/api/moderation/articles/${articleId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reason }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save the review decision.');
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save the review decision.'); setSaving(false); }
  }
  return <div className="mt-5 border-t pt-5" style={{ borderColor: 'var(--line)' }}><label htmlFor={`review-reason-${articleId}`} className="text-sm font-semibold">Review note or rejection reason</label><textarea id={`review-reason-${articleId}`} value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={2} placeholder="Required when rejecting; visible to the author." className="mt-2 w-full rounded border bg-transparent p-3 text-sm" style={{ borderColor: 'var(--line)' }}/><div className="mt-3 flex flex-wrap gap-3"><button onClick={() => decide('publish')} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Check size={15}/>} Approve and publish</button><button onClick={() => decide('reject')} disabled={saving || reason.trim().length < 10} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-50" style={{ borderColor: 'var(--line)' }}><X size={15}/> Reject</button></div>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
