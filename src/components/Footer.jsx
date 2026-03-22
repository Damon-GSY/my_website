export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA' },
    { name: 'Bilibili', href: 'https://space.bilibili.com/358541297' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/' },
    { name: 'GitHub', href: 'https://github.com/Damon-GSY' },
    { name: 'Email', href: 'mailto:hello@damon.ai' },
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Damon</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              AI researcher, content creator, and lifelong learner. Building at the intersection of technology and creativity.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Connect</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter CTA */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Stay Updated</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              Subscribe to get the latest updates on AI, productivity, and building online.
            </p>
            <a
              href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Subscribe ↗
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">© {year} Shengyue Guan. All rights reserved.</p>
          <p className="text-zinc-400 text-xs">
            Built with ❤️ using React + Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
