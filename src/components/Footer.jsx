export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          © {year} Damon. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            YouTube
          </a>
          <a
            href="https://space.bilibili.com/358541297"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Bilibili
          </a>
        </div>
      </div>
    </footer>
  );
}
