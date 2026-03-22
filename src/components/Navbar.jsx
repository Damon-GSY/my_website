import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-zinc-200/70 bg-white/82 backdrop-blur-xl shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="text-xl font-bold tracking-tight text-zinc-950 transition-colors">
            Damon.AI
          </a>

          <div className="hidden sm:flex gap-6 text-sm font-medium text-zinc-600">
            <a href="#home" className="transition-colors hover:text-zinc-900">
              Home
            </a>
            <a href="#about" className="transition-colors hover:text-zinc-900">
              About
            </a>
            <a href="#whatido" className="transition-colors hover:text-zinc-900">
              What I Do
            </a>
          </div>

          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noreferrer"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-900 transition ${
              isScrolled
                ? 'border border-zinc-300 bg-white hover:border-zinc-900'
                : 'border border-zinc-300/60 bg-white/70 backdrop-blur hover:border-zinc-900'
            }`}
          >
            Connect
          </a>
        </div>
      </div>
    </nav>
  );
}
