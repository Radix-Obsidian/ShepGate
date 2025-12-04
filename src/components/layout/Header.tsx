'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
      >
        {loggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </header>
  );
}
