import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Cpu,
  Gauge,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { ExpandableTabs } from '../ui/expandable-tabs';
import {
  TerminalAnimationRoot,
  TerminalAnimationContainer,
  TerminalAnimationWindow,
  TerminalAnimationContent,
  TerminalAnimationCommandBar,
  TerminalAnimationOutput,
  TerminalAnimationTabList,
  TerminalAnimationTabTrigger,
} from '../ui/terminal-animation';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const terminalTabs = [
  {
    label: 'eval',
    command: '$ agent eval --trace multi-turn',
    lines: [
      { text: '', delay: 100 },
      { text: '  ✓ eval gate passed (92%)', color: 'text-[#22ff73]', delay: 400 },
      { text: '', delay: 100 },
      { text: '  Checking 47 evaluation vectors...', color: 'text-neutral-400', delay: 200 },
      { text: '    Tool selection accuracy  96.2%', color: 'text-neutral-300', delay: 150 },
      { text: '    Recovery success rate    89.4%', color: 'text-neutral-300', delay: 150 },
      { text: '    Multi-step reasoning      94.1%', color: 'text-neutral-300', delay: 150 },
      { text: '    Human intervention rate   3.8%', color: 'text-neutral-300', delay: 150 },
      { text: '', delay: 200 },
      { text: '  Evaluation complete. Ready for deployment.', color: 'text-[#32f3e9]', delay: 300 },
    ],
  },
  {
    label: 'train',
    command: '$ agent tool resolve --pool 100+',
    lines: [
      { text: '', delay: 100 },
      { text: '  → 4 candidates selected', color: 'text-[#b39aff]', delay: 400 },
      { text: '', delay: 100 },
      { text: '  Tool resolution analysis:', color: 'text-neutral-400', delay: 200 },
      { text: '    API router         matched (0.94)', color: 'text-neutral-300', delay: 150 },
      { text: '    Database query     matched (0.87)', color: 'text-neutral-300', delay: 150 },
      { text: '    File system        matched (0.82)', color: 'text-neutral-300', delay: 150 },
      { text: '    External webhook    matched (0.76)', color: 'text-neutral-300', delay: 150 },
      { text: '', delay: 200 },
      { text: '  Surface area reduced by 96%', color: 'text-[#32f3e9]', delay: 300 },
    ],
  },
  {
    label: 'deploy',
    command: '$ agent ship --checkpoint',
    lines: [
      { text: '', delay: 100 },
      { text: '  ✓ handoff saved (<1s)', color: 'text-[#22ff73]', delay: 400 },
      { text: '', delay: 100 },
      { text: '  Deployment checkpoint:', color: 'text-neutral-400', delay: 200 },
      { text: '    State snapshot      2.4 MB', color: 'text-neutral-300', delay: 150 },
      { text: '    Tool registry       847 tools', color: 'text-neutral-300', delay: 150 },
      { text: '    Eval history        12k traces', color: 'text-neutral-300', delay: 150 },
      { text: '    Rollback enabled    ✓', color: 'text-[#22ff73]', delay: 150 },
      { text: '', delay: 200 },
      { text: '  Agent deployed to production', color: 'text-[#32f3e9]', delay: 300 },
    ],
  },
];

const modeTabs = [
  { title: 'Eval', icon: ShieldCheck },
  { title: 'Train', icon: Cpu },
  { type: 'separator' },
  { title: 'Deploy', icon: Activity },
];

const capabilityCards = [
  {
    icon: Network,
    title: 'Agent System Design',
    copy: 'Planning, tool orchestration, memory windows, and human approval boundaries.',
  },
  {
    icon: Gauge,
    title: 'Post-Training & Eval',
    copy: 'SFT and RL loops tied to measurable business behavior, not abstract demos.',
  },
  {
    icon: ShieldCheck,
    title: 'Production Deploy',
    copy: 'Trace-level checks for recovery, wrong-tool use, and compounding failures.',
  },
];

export default function Capabilities() {
  const [activeTerminal, setActiveTerminal] = useState(0);
  const reducedMotion = useReducedMotion();

  const handleModeChange = (index) => {
    const terminalIndexByTabIndex = { 0: 0, 1: 1, 3: 2 };
    if (index === null) return;
    if (terminalIndexByTabIndex[index] !== undefined) {
      setActiveTerminal(terminalIndexByTabIndex[index]);
    }
  };

  const activeTab = terminalTabs[activeTerminal];

  return (
    <section
      id="capabilities"
      className="agent-os-section pb-4 pt-20 md:pb-0 md:pt-28"
      aria-labelledby="capabilities-title"
    >
      <div className="agent-os-inner">
        <motion.div
          variants={fadeUp}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 grid gap-6 md:mb-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end"
        >
          <div>
            <p className="agent-os-inline-label">[01] capabilities</p>
            <h2
              id="capabilities-title"
              className="font-display text-4xl font-medium leading-none tracking-tight text-[var(--text)] md:text-6xl"
            >
              Agent cockpit,
              <br />
              not demo cards.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
            I design the operating layer around LLM systems: the tool surface,
            training loop, evaluation harness, and production handoff. This
            section stays in one surface: runtime first, then controls, then
            the shipped work objects.
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3 md:px-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  agent runtime
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
                trace / live
              </span>
            </div>

            <div className="p-3 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <ExpandableTabs
                  tabs={modeTabs}
                  onChange={handleModeChange}
                  className="max-w-full"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  runtime selector
                </span>
              </div>

              {reducedMotion ? (
                <div className="min-h-80 overflow-x-auto rounded-xl bg-[#0a0a0a] p-5 font-mono text-sm leading-relaxed text-neutral-300 md:p-8">
                  <p className="mb-4 text-white">{activeTab.command}</p>
                  <div className="space-y-1">
                    {activeTab.lines.map((line, index) => (
                      <p key={`${activeTab.label}-${index}`} className={line.color}>
                        {line.text || '\u00A0'}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <TerminalAnimationRoot
                  tabs={terminalTabs}
                  activeTab={activeTerminal}
                  onActiveTabChange={setActiveTerminal}
                  alwaysDark
                  hideCursorOnComplete={false}
                >
                  <TerminalAnimationContainer className="max-w-none px-0 pb-0 pt-0 md:px-0 md:pt-0">
                    <TerminalAnimationWindow
                      minHeight="0"
                      backgroundColor="#0a0a0a"
                      animateOnVisible={false}
                      className="h-[15rem] rounded-xl"
                    >
                      <TerminalAnimationContent className="h-full overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
                        <TerminalAnimationTabList className="mb-4 flex gap-2 overflow-x-auto border-b border-neutral-800 px-2 pb-3">
                          {terminalTabs.map((tab, index) => (
                            <TerminalAnimationTabTrigger
                              key={tab.label}
                              index={index}
                              className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--muted)] transition-colors hover:text-[var(--text)] data-[state=active]:text-[var(--primary)]"
                            >
                              {tab.label}
                            </TerminalAnimationTabTrigger>
                          ))}
                        </TerminalAnimationTabList>
                        <div className="mb-4 grid gap-3 rounded-xl border border-neutral-800 bg-white/[0.035] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                              active trace
                            </p>
                            <p className="mt-1 truncate font-mono text-xs text-neutral-200">
                              {activeTab.command}
                            </p>
                          </div>
                          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#22ff73]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22ff73]" aria-hidden="true" />
                            {activeTerminal === 0 ? 'eval gate ready / 92%' : activeTerminal === 1 ? 'resolver ready / 4 tools' : 'checkpoint ready / <1s'}
                          </span>
                        </div>
                        <div className="h-14 overflow-hidden border-t border-neutral-900 pt-3 font-mono text-sm leading-relaxed">
                          <TerminalAnimationCommandBar className="mb-4 text-[var(--text)]" />
                          <TerminalAnimationOutput className="space-y-1 text-[var(--muted-strong)]" />
                        </div>
                      </TerminalAnimationContent>
                    </TerminalAnimationWindow>
                  </TerminalAnimationContainer>
                </TerminalAnimationRoot>
              )}
            </div>

            <div className="grid border-t border-[var(--line)] sm:grid-cols-3">
              {capabilityCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className={`p-5 transition-colors duration-300 hover:bg-[var(--surface-soft)] ${
                      index > 0 ? 'border-t border-[var(--line)] sm:border-l sm:border-t-0' : ''
                    }`}
                  >
                    <Icon className="mb-4 h-5 w-5 text-[var(--primary)]" />
                    <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {item.copy}
                    </p>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
