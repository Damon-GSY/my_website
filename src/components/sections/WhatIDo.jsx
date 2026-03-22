export default function WhatIDo() {
  const items = [
    {
      title: 'AI & ML Research',
      description: 'Focusing on LLM evaluation, post-training optimization, and agentic reinforcement learning. Bridging theoretical algorithms with industrial applications.',
      className: 'col-span-1 md:col-span-2 row-span-2',
      color: 'blue',
      icon: '🧠',
    },
    {
      title: 'YouTube',
      description: 'English tech explorations',
      href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA',
      color: 'red',
      icon: '▶️',
    },
    {
      title: 'Bilibili',
      description: '中文硬核技术分享',
      href: 'https://space.bilibili.com/358541297',
      color: 'pink',
      icon: '📺',
    },
    {
      title: 'LinkedIn',
      description: 'Professional network',
      href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/',
      color: 'sky',
      icon: '💼',
    },
    {
      title: 'GitHub',
      description: 'Open source contributions',
      href: 'https://github.com/Damon-GSY',
      color: 'gray',
      icon: '🐙',
    },
  ];

  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800/50',
      hover: 'hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-900/50 dark:hover:to-blue-950/50',
      title: 'text-blue-700 dark:text-blue-400',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30',
      border: 'border-red-200 dark:border-red-800/50',
      hover: 'hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/50 dark:hover:to-red-950/50',
      title: 'text-red-700 dark:text-red-400',
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/50 dark:to-pink-900/30',
      border: 'border-pink-200 dark:border-pink-800/50',
      hover: 'hover:from-pink-100 hover:to-pink-50 dark:hover:from-pink-900/50 dark:hover:to-pink-950/50',
      title: 'text-pink-700 dark:text-pink-400',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/50 dark:to-sky-900/30',
      border: 'border-sky-200 dark:border-sky-800/50',
      hover: 'hover:from-sky-100 hover:to-sky-50 dark:hover:from-sky-900/50 dark:hover:to-sky-950/50',
      title: 'text-sky-700 dark:text-sky-400',
    },
    gray: {
      bg: 'bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-900/30',
      border: 'border-zinc-200 dark:border-zinc-700/50',
      hover: 'hover:from-zinc-100 hover:to-zinc-50 dark:hover:from-zinc-700/50 dark:hover:to-zinc-800/50',
      title: 'text-zinc-700 dark:text-zinc-300',
    },
  };

  return (
    <section className="py-20 bg-white dark:bg-zinc-900" id="whatido">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900 dark:text-zinc-100">
          What I Do
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {items.map((item, index) => {
            const colors = colorMap[item.color];
            const content = (
              <>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className={`text-xl md:text-2xl font-bold mb-2 ${colors.title}`}>
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
                {item.href && (
                  <div className="absolute bottom-6 right-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    ↗
                  </div>
                )}
              </>
            );

            const cardClass = `
              ${colors.bg} ${colors.border} ${colors.hover}
              ${item.className || ''}
              rounded-2xl border p-6 md:p-8
              flex flex-col justify-end
              transition-all duration-300
              group relative
            `;

            if (item.href) {
              return (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cardClass}
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={index} className={cardClass}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
