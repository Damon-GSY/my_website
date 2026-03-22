import { forwardRef } from 'react';
import { motion } from 'framer-motion';

// Improved hover config - ease-out for smooth, natural deceleration
const cardHover = {
  whileHover: {
    scale: 1.02,
    y: -4,
    transition: { type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  transition: { type: "tween", duration: 0.25, ease: [0.16, 1, 0.3, 1] }
};

// Animated progress ring for 94% card
const ProgressRing = ({ progress = 94, size = 100, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-700/50"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Animated model tag for background
const ModelTag = ({ name, color, index = 0 }) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
    aria-hidden="true"
  >
    <span className={`w-1.5 h-1.5 ${color} rounded-full`} />
    {name}
  </motion.span>
)

const WhatIDo = forwardRef(function WhatIDo(props, ref) {
  return (
    <section className="w-full py-16 lg:py-24 bg-white dark:bg-zinc-900" id="whatido">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900 dark:text-zinc-100">
          What I Do
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[280px]">

          {/* 卡片1: Multi-Agent Systems */}
          <motion.div
            className="md:col-span-2 relative bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 group overflow-hidden focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            {...cardHover}
          >
            {/* Floating tech tags - decorative background */}
            <div className="absolute bottom-6 left-8 right-8 flex flex-wrap gap-2 opacity-40 dark:opacity-30 pointer-events-none" aria-hidden>
              <ModelTag name="GPT-4o" color="bg-emerald-500" index={0} />
              <ModelTag name="Claude 3.5" color="bg-orange-500" index={1} />
              <ModelTag name="Qwen" color="bg-blue-500" index={2} />
              <ModelTag name="LLaMA 3" color="bg-cyan-500" index={3} />
              <ModelTag name="Gemini" color="bg-purple-500" index={4} />
              <ModelTag name="Mistral" color="bg-rose-500" index={5} />
              <ModelTag name="DeepSeek" color="bg-indigo-500" index={6} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Architecture
                </span>
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                Multi-Agent Systems
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base max-w-lg mb-4">
                Designing collaborative AI environments where specialized agents negotiate and solve complex multi-step tasks autonomously.
              </p>
            </div>
          </motion.div>

          {/* 卡片2: 94% */}
          <motion.div
            className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2"
            {...cardHover}
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient:_from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden />

            <ProgressRing progress={94} size={100} />

            <h3 className="text-4xl font-bold text-blue-400 mt-4 relative z-10">94%</h3>
            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase relative z-10 mt-1">
              Efficiency Gain
            </p>
          </motion.div>

          {/* 卡片3: Industrial Optimization */}
          <motion.div
            className="md:col-span-2 relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 group overflow-hidden focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            {...cardHover}
          >
            {/* Code snippet background */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full overflow-hidden opacity-10 dark:opacity-20 pointer-events-none" aria-hidden>
              <pre className="text-[8px] md:text-[10px] font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre p-4">
{`def optimize_workflow(data):
    model = Qwen72B(lora_adapter)
    context = rag_pipeline.query(data)
    return model.generate(context)

# LoRA fine-tuning config
lora_config = {
    "r": 16,
    "target_modules": [
        "q_proj", "v_proj",
        "k_proj", "o_proj"
    ]
}

# RAG Pipeline
def build_rag(docs):
    embeddings = encode(docs)
    index = faiss.Index(embeddings)
    return Retriever(index)`}</pre>
            </div>

            <div className="relative z-10">
              <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-4">
                Vertical Model
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                Industrial Optimization
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base max-w-lg mb-4">
                A bespoke neural framework developed for the Chengdu-Chongqing economic circle, optimizing industrial workflows with domain-specific LLMs.
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800/50">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  LoRA Fine-tuning
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium border border-cyan-200 dark:border-cyan-800/50">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                  RAG Pipeline
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800/50">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Qwen-72B
                </span>
              </div>
            </div>
          </motion.div>

          {/* 卡片4: 10x */}
          <motion.div
            className="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-zinc-200 dark:border-zinc-700 overflow-hidden focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            {...cardHover}
          >
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
              <motion.div
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl"
                animate={{
                  x: [0, 20, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-rose-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl"
                animate={{
                  x: [0, -20, 0],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <h3 className="text-5xl md:text-6xl font-bold mb-2 relative z-10 bg-gradient-to-r from-violet-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
              10x
            </h3>
            <p className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase relative z-10">
              Faster Iteration
            </p>
          </motion.div>

        </div>

        {/* Social Links */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <a
            href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            title="YouTube"
            aria-label="YouTube"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a
            href="https://space.bilibili.com/358541297"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-pink-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            title="Bilibili"
            aria-label="Bilibili"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.813 4.653h.004c.507 0 .972.242 1.263.636.29.394.385.895.257 1.362l-2.27 7.633a1.71 1.71 0 0 1-1.633 1.197h-3.377a.57.57 0 0 0-.547.42l-.442 1.537a.57.57 0 0 0 .547.723h2.384c.433 0 .82.278.957.69a1.02 1.02 0 0 1-.182.963l-4.96 5.427a1.02 1.02 0 0 1-1.097.268 1.02 1.02 0 0 1-.663-.886l-.515-4.632a.57.57 0 0 0-.566-.508H6.28a1.71 1.71 0 0 1-1.643-1.237L2.413 6.65a1.71 1.71 0 0 1 .29-1.488 1.71 1.71 0 0 1 1.353-.664h3.076c.417 0 .793.253.948.637l1.053 2.617h3.404l1.053-2.617a1.02 1.02 0 0 1 .948-.637h3.278z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729(24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="https://github.com/Damon-GSY"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            title="GitHub"
            aria-label="GitHub"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
});

export default WhatIDo
