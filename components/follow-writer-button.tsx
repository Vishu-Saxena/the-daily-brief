'use client';

import { UserRoundPlus, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function FollowWriterButton({ writerId, initialFollowing, initialFollowers, isWriter = false, hideWhenUnfollowed = false, showCount = true }: { writerId: string; initialFollowing: boolean; initialFollowers: number; isWriter?: boolean; hideWhenUnfollowed?: boolean; showCount?: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/follows/${writerId}`, { method: following ? 'DELETE' : 'POST' });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Could not update follow status.'); return; }
      setFollowing(data.following); setFollowers(data.followerCount); if (hideWhenUnfollowed && !data.following) { setHidden(true); router.refresh(); }
    } catch { setError('Could not update follow status.'); }
    finally { setBusy(false); }
  }

  if (hidden) return null;
  return <div className="flex flex-wrap items-center gap-3">
    {showCount && <span className="text-sm" style={{ color: 'var(--muted)' }}>{followers} {followers === 1 ? 'follower' : 'followers'}</span>}
    {!isWriter && <button onClick={toggle} disabled={busy} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-60" style={{ borderColor: 'var(--line)' }}>
      {following ? <UserRoundCheck size={16}/> : <UserRoundPlus size={16}/>} {busy ? 'Updating…' : following ? 'Following' : 'Follow author'}
    </button>}
    {error && <span role="alert" className="basis-full text-sm text-red-700">{error} {error.includes('Sign in') && <a href="/login" className="underline">Sign in</a>}</span>}
  </div>;
}
