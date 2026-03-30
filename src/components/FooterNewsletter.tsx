'use client';
import { useState } from 'react';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('newsletter_subscribed', 'true');
        setEmail('');
      } else {
        throw new Error();
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-6">
        <p className="text-[13px] font-medium text-accent">
          You&apos;re subscribed! 🔥
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-[13px] font-medium text-text-secondary">
        Stay updated
      </p>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="min-w-0 flex-1 rounded-btn border border-subtle bg-surface px-3 py-2 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-btn bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-1 text-xs text-red-400">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
