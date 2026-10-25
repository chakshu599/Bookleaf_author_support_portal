'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message || 'Unable to sign in.');
      return;
    }
    router.replace(result.data.role === 'ADMIN' ? '/admin/tickets' : '/author/books');
    router.refresh();
  }

  return <section className="card login">
    <h1>BookLeaf Author Support</h1>
    <form onSubmit={submit}>
      <label>Email<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary" type="submit">Sign in</button>
    </form>
  </section>;
}