export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Damon
          </a>
          <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              About
            </a>
            <a href="#whatido" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              What I Do
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
