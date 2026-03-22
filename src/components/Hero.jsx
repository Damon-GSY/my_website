export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950" id="home">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">
              Hey Friends 👋
              <br />
              <span className="text-blue-600 dark:text-blue-400">I'm Damon.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              I'm an AI & Machine Learning researcher. I make videos on YouTube and Bilibili exploring tech, algorithms, and how AI is transforming industries.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-center hover:scale-105 transition-transform"
              >
                Watch on YouTube
              </a>
              <a
                href="https://space.bilibili.com/358541297"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold text-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100"
              >
                Follow on Bilibili
              </a>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="flex justify-center md:justify-end">
            <div className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl rotate-3 shadow-xl overflow-hidden border-4 border-white dark:border-zinc-800">
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-lg">
                [Your Photo]
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
