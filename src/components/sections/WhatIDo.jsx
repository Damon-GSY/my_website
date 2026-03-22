export default function WhatIDo() {
  const items = [
    {
      title: 'AI & ML Research',
      description: 'Focusing on LLM evaluation, post-training, and agentic RL. Bridging the gap between theoretical algorithms and real-world applications.',
      className: 'col-span-1 md:col-span-2',
      color: 'blue',
    },
    {
      title: 'YouTube',
      description: 'Tech explorations and AI tutorials in English.',
      href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA',
      color: 'red',
    },
    {
      title: 'Bilibili 哔哩哔哩',
      description: '中文硬核技术分享与 AI 教程。',
      href: 'https://space.bilibili.com/358541297',
      className: 'col-span-1 md:col-span-2',
      color: 'pink',
    },
    {
      title: 'LinkedIn',
      description: 'Professional network & career updates.',
      href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/',
      color: 'sky',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    red: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50',
    pink: 'bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/50 hover:bg-pink-100 dark:hover:bg-pink-900/50',
    sky: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-900/50',
  };

  return (
    <section className="py-20 bg-white dark:bg-zinc-900" id="whatido">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10 text-zinc-900 dark:text-zinc-100">What I Do</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {items.map((item, index) => {
            const content = (
              <>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </>
            );

            const cardClass = `${colorMap[item.color]} ${item.className || ''} rounded-2xl border p-8 flex flex-col justify-end transition-colors`;

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
