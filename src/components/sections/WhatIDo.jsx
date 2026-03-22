import { forwardRef } from 'react';

const WhatIDo = forwardRef(function WhatIDo(props, ref) {
  return (
    <section className="w-full py-16 lg:py-24 bg-white dark:bg-zinc-900" id="whatido">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900 dark:text-zinc-100">
          What I Do
        </h2>

        {/* Bento Grid - 核心能力展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[240px]">

          {/* 卡片1: Multi-Agent Systems (大卡片，带技术栈) */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 group overflow-hidden flex flex-col justify-between hover:border-blue-500/30 hover:shadow-lg transition-all">
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
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base mb-5">
                Designing collaborative AI environments where specialized agents negotiate and solve complex multi-step tasks autonomously.
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  GPT-4o
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-800/50">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  Claude
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800/50">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Qwen
                </span>
              </div>
            </div>
          </div>

          {/* 卡片2: 效率数据 (深色小卡片) */}
          <div className="bg-gradient-to-br from-[#1e3a4a] to-[#0f172a] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl md:text-6xl font-bold text-[#60a5fa] mb-2">94%</h3>
            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Efficiency Gain</p>
          </div>

          {/* 卡片3: Industrial Optimization (横向大卡片，带技术栈) */}
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 group overflow-hidden flex flex-col md:flex-row gap-6 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg transition-all">
            <div className="flex-1">
              <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-4">
                Vertical Model
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                Industrial Optimization
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base mb-4">
                A bespoke neural framework developed for the Chengdu-Chongqing economic circle, optimizing industrial workflows with domain-specific LLMs.
              </p>
              {/* Tech Stack for Vertical Model */}
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
            {/* 右侧图片区域 */}
            <div className="w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex-shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {/* 卡片4: 效率提升 */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">10x</h3>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Faster Iteration</p>
          </div>

        </div>

        {/* Social Links - 简洁的图标链接行 */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <a
            href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-red-500 transition-colors"
            title="YouTube"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a
            href="https://space.bilibili.com/358541297"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-pink-500 transition-colors"
            title="Bilibili"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.813 4.653h.004c.507 0 .972.242 1.263.636.29.394.385.895.257 1.362l-2.27 7.633a1.71 1.71 0 0 1-1.633 1.197h-3.377a.57.57 0 0 0-.547.42l-.442 1.537a.57.57 0 0 0 .547.723h2.384c.433 0 .82.278.957.69a1.02 1.02 0 0 1-.182.963l-4.96 5.427a1.02 1.02 0 0 1-1.097.268 1.02 1.02 0 0 1-.663-.886l-.515-4.632a.57.57 0 0 0-.566-.508H6.28a1.71 1.71 0 0 1-1.643-1.237L2.413 6.65a1.71 1.71 0 0 1 .29-1.488 1.71 1.71 0 0 1 1.353-.664h3.076c.417 0 .793.253.948.637l1.053 2.617h3.404l1.053-2.617a1.02 1.02 0 0 1 .948-.637h3.278z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-blue-600 transition-colors"
            title="LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="https://github.com/Damon-GSY"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="GitHub"
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

export default WhatIDo;
