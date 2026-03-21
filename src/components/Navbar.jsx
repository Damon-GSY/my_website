export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="text-xl font-bold text-white">
            Damon
          </a>
          <div className="flex gap-6">
            <a href="#about" className="text-zinc-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#projects" className="text-zinc-400 hover:text-white transition-colors">
              Projects
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
