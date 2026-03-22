import { ShimmerButton } from './ui/shimmer-button';
import { Marquee } from './ui/magicui/marquee';

const techStack = [
  { name: 'PyTorch', icon: '🔥' },
  { name: 'TensorFlow', icon: '🧠' },
  { name: 'Next.js', icon: '▲' },
  { name: 'React', icon: '⚛️' },
  { name: 'Python', icon: '🐍' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Tailwind', icon: '🎨' },
  { name: 'LLM', icon: '🤖' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950" id="home">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">
              Hey Friends{' '}
              <span className="inline-block animate-wiggle">👋</span>
              <br />
              <span className="text-blue-600 dark:text-blue-400">I'm Damon.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              I'm an AI & Machine Learning researcher. I make videos on{' '}
              <a
                href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                YouTube
              </a>{' '}
              and{' '}
              <a
                href="https://space.bilibili.com/358541297"
                target="_blank"
                rel="noreferrer"
                className="text-pink-600 dark:text-pink-400 hover:underline"
              >
                Bilibili
              </a>{' '}
              exploring tech, algorithms, and how AI is reshaping our world.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
                target="_blank"
                rel="noreferrer"
              >
                <ShimmerButton
                  shimmerColor="#ffffff"
                  background="linear-gradient(135deg, #dc2626, #ef4444)"
                  borderRadius="12px"
                  className="px-8 py-4 text-white font-semibold"
                >
                  Subscribe on YouTube
                </ShimmerButton>
              </a>
              <a
                href="https://space.bilibili.com/358541297"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 font-semibold text-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100"
              >
                关注 Bilibili
              </a>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/30 rounded-3xl rotate-3 shadow-2xl overflow-hidden border-4 border-white dark:border-zinc-800 transition-transform hover:rotate-0 duration-300">
                <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <div className="text-center">
                    <div className="text-6xl mb-2">👨‍💻</div>
                    <p className="text-sm">Your Photo Here</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee */}
      <div className="border-t border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-6 mt-12">
        <Marquee className="[--duration:30s]" pauseOnHover>
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"
            >
              <span className="text-xl">{tech.icon}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {tech.name}
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Add wiggle animation */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
