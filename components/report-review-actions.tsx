'use client';

import { useState } from 'react';
import { Check, LoaderCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ReportReviewActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function review(decision: 'confirm' | 'dismiss') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/moderation/reports/${reportId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not review this flag.');
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not review this flag.'); setBusy(false); }
  }
  return <div className="mt-4 flex flex-wrap gap-3"><button onClick={() => review('confirm')} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <Check size={15}/>} Confirm concern</button><button onClick={() => review('dismiss')} disabled={busy} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-50" style={{ borderColor: 'var(--line)' }}><X size={15}/> Dismiss flag</button>{error && <p role="alert" className="basis-full text-sm text-red-700">{error}</p>}</div>;
}
