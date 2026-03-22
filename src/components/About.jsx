import { Timeline } from './ui/timeline';

export default function About() {
  const timelineData = [
    {
      title: "2024",
      content: (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            LLM Algorithm Engineer @ Alibaba
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Hangzhou, China</p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Building vertical LLM solutions for enterprise clients. Focused on post-training optimization,
            RAG pipelines, and multi-agent system architecture.
          </p>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            MSc in AI @ National University of Singapore
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Singapore</p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Research focus on LLM evaluation and agentic reinforcement learning.
            Thesis: "Evaluating Multi-Agent Coordination in Complex Task Environments"
          </p>
        </div>
      ),
    },
    {
      title: "2022",
      content: (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Content Creator @ YouTube & Bilibili
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Remote</p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Started creating educational content about AI workflows, productivity systems,
            and building online businesses. Grew to 50k+ subscribers across platforms.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-zinc-50 dark:bg-zinc-950" id="about">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          About Me
        </h2>

        <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-12">
          <p>
            I'm an AI researcher and content creator based in Singapore, currently pursuing my master's degree at NUS while working as an LLM Algorithm Engineer at Alibaba.
          </p>
          <p>
            My research focuses on <span className="text-zinc-900 dark:text-zinc-100 font-medium">LLM evaluation, post-training optimization, and agentic reinforcement learning</span>. I'm passionate about bridging the gap between theoretical algorithms and real-world industrial applications.
          </p>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
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

        {/* Timeline Section */}
        <div className="mt-8">
          <Timeline data={timelineData} />
        </div>
      </div>
    </section>
  );
}
