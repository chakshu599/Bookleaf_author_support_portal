'use client';

import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      router.replace('/login');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out. Please try again.');
      setBusy(false);
    }
  }
  return <div>
    <button type="button" onClick={signOut} disabled={busy} aria-busy={busy}>
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
    {error && <small role="alert">{error}</small>}
  </div>;
}
