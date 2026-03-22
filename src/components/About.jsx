export default function About() {
  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-950" id="about">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
          About Me
        </h2>

        <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            I'm an AI researcher and content creator based in Singapore, currently pursuing my master's degree at NUS while working as an LLM Algorithm Engineer at Alibaba.
          </p>
          <p>
            My research focuses on <span className="text-zinc-900 dark:text-zinc-100 font-medium">LLM evaluation, post-training optimization, and agentic reinforcement learning</span>. I'm passionate about bridging the gap between theoretical algorithms and real-world industrial applications.
          </p>
          <p>
            Beyond research, I create content on <a href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">YouTube</a> and <a href="https://space.bilibili.com/358541297" target="_blank" rel="noreferrer" className="text-pink-600 dark:text-pink-400 hover:underline">Bilibili</a>, sharing practical insights about productivity, AI workflows, and building online businesses.
          </p>
        </div>

        {/* Quick Facts */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Location', value: 'Singapore' },
            { label: 'University', value: 'NUS' },
            { label: 'Work', value: 'Alibaba' },
            { label: 'Languages', value: 'EN / 中文' },
          ].map((fact) => (
            <div key={fact.label} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">{fact.label}</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{fact.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
