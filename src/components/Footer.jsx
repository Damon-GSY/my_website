export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)] py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
        <span>© {year} Shengyue Guan</span>
        <span className="hidden md:inline">Designed in Hangzhou · Built with GSAP</span>
        <span>v2.0</span>
      </div>
    </footer>
  );
}
