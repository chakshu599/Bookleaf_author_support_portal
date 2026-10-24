'use client';

import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';

export function SiteHeader({ role }: { role: string | null }) {
  const pathname = usePathname();
  if (!role || pathname === '/' || pathname === '/login') return null;

  return <header>
    <a href="/">BookLeaf</a>
    <nav>
      {role === 'AUTHOR' && <>
        <a href="/author/books">My books</a>
        <a href="/author/query">New query</a>
        <a href="/author/tickets">My tickets</a>
      </>}
      {role === 'ADMIN' && <a href="/admin/tickets">Admin</a>}
    </nav>
    <SignOutButton />
  </header>;
}
