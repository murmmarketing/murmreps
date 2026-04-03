'use client';
import { useState, useEffect } from 'react';

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dismissed = localStorage.getItem('newsletter_dismissed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    if (dismissed || subscribed) return;

    // Show after 30 seconds or 50% scroll
    const timer = setTimeout(() => setShow(true), 30000);

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.5) {
        setShow(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup', ref_code: localStorage.getItem('murmreps_ref') || undefined }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Welcome to MurmReps! Check your inbox 🔥');
        localStorage.setItem('newsletter_subscribed', 'true');
        setTimeout(() => setShow(false), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('newsletter_dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-2xl">
        {/* Orange glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl"
          style={{ background: 'linear-gradient(to right, transparent, #FE4205, transparent)' }}
        />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#6B7280] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🔥</div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              You&apos;re in!
            </h3>
            <p className="text-[#9CA3AF]">{message}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🔥</div>
              <h3
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Get the best finds first
              </h3>
              <p className="text-[#9CA3AF] text-sm">
                Weekly drops, exclusive deals, and agent comparison guides. Join 2,300+ repfam.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-3 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#FE4205] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-[#FE4205] hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {status === 'loading' ? 'Signing up...' : 'Join the repfam'}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-sm text-center">{message}</p>
              )}
            </form>

            <p className="text-[#4B5563] text-xs text-center mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
