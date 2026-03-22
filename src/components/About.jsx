import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Timeline } from './ui/timeline';

const TRACK_STYLES = {
  'Full-time': {
    chip: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    iconWrap: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    dot: 'bg-cyan-500/80',
    edge: 'from-cyan-300/70 to-transparent',
  },
  Internship: {
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    iconWrap: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500/80',
    edge: 'from-amber-300/70 to-transparent',
  },
  Education: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconWrap: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500/80',
    edge: 'from-emerald-300/70 to-transparent',
  },
  Research: {
    chip: 'border-sky-200 bg-sky-50 text-sky-700',
    iconWrap: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-500/80',
    edge: 'from-sky-300/70 to-transparent',
  },
  'Project / Competition': {
    chip: 'border-violet-200 bg-violet-50 text-violet-700',
    iconWrap: 'border-violet-200 bg-violet-50 text-violet-700',
    dot: 'bg-violet-500/80',
    edge: 'from-violet-300/70 to-transparent',
  },
};

const TRACK_ICONS = {
  'Full-time': BriefcaseBusiness,
  Internship: FlaskConical,
  Education: GraduationCap,
  Research: FileText,
  'Project / Competition': Trophy,
};

function TimelineCard({ track, title, location, points }) {
  const style = TRACK_STYLES[track] ?? TRACK_STYLES['Project / Competition'];
  const TrackIcon = TRACK_ICONS[track] ?? Sparkles;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_24px_54px_-42px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_66px_-42px_rgba(15,23,42,0.52)]">
      <div className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${style.edge}`} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${style.chip}`}>
          {track}
        </span>
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${style.iconWrap}`}>
          <TrackIcon className="h-4 w-4" />
        </div>
      </div>

      <h4 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 mb-2">
        {title}
      </h4>
      <p className="text-sm text-zinc-500 mb-4">{location}</p>

      <ul className="space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5 text-zinc-600 leading-relaxed">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function About() {
  const aboutProfile = {
    title: 'About Me',
    intro:
      'AI researcher and algorithm engineer focused on LLM systems, post-training, and agentic reinforcement learning.',
    focus:
      'I bridge research and production: from benchmark design and training pipelines to deployable agent systems in real business scenarios.',
    facts: [
      { label: 'Current Role', value: 'Alibaba · LLM Engineer' },
      { label: 'Graduate School', value: 'NUS (QS #8)' },
      { label: 'Undergraduate', value: 'UNSW (QS #19)' },
    ],
  };

  const timelineData = [
    {
      title: '2025',
      content: (
        <div className="space-y-4">
          <TimelineCard
            track="Full-time"
            title="LLM Algorithm Engineer @ Alibaba"
            location="Hangzhou, China"
            points={[
              'Led end-to-end training of a supply-chain domain LLM: built a dual-axis benchmark for knowledge QA and tool use, then achieved internal SOTA through continual pretraining plus integrated SFT/RL.',
              'Trained a multi-task, multi-objective product-attribute model (fulfillment, bundle consolidation, HS Code, etc.); addressed GRPO gradient imbalance with conditional reward design, variance control, zero-gradient filtering, and hierarchical rewards.',
              'Designed agentic RL training for ticket-resolution assistants and implemented dynamic tool registration (100+ tools), enabling Meta Tool access to a dynamic tool pool and reducing manual ticket handling by 90%.',
              'Built a risk-tiered multi-turn decision framework with progressive confirmations and explicit automation boundaries; reduced misoperations by 90%, cut manual interventions by 95%, and brought exception handoff latency below 1 second across 12 supply-chain scenarios.',
            ]}
          />
          <TimelineCard
            track="Research"
            title="Evaluating LLM-based Agents for Multi-turn Conversation"
            location="Research Paper | 2025"
            points={[
              'Systematically reviewed around 250 papers and built a two-layer taxonomy that defines both what to evaluate and how to evaluate multi-turn LLM agents.',
              'Constructed a three-layer tool-use evaluation framework covering API execution accuracy, cross-turn multi-step tool-chain reasoning, and tool-hallucination detection.',
              'Identified a key benchmark gap in cross-turn replanning: current test sets under-evaluate whether an agent can recover and re-plan after step failures or user-intent shifts.',
              'Proposed a four-dimension planning evaluation framework: task modeling, task decomposition, in-dialog dynamic adjustment, and self-reflection plus verification.',
              'Defined a three-level memory-horizon taxonomy (turn-level memory, session memory, and persistent memory) with differentiated evaluation criteria and benchmarks.',
              'Separated memory form into an explicit evaluation axis: parametric memory in model weights versus external retrieval memory in textual storage, with distinct tradeoffs in adaptability and reasoning speed.',
              'Introduced Agent-as-Judge as a multi-turn evaluation paradigm that scores intermediate steps and dependency chains, yielding stronger alignment with human judgments than final-answer-only evaluation.',
            ]}
          />
          <TimelineCard
            track="Research"
            title="SupChain-Bench: Benchmarking Large Language Models for Real-World Supply Chain Management"
            location="Research Paper | 2025"
            points={[
              'Built SupChain-Bench, the first unified supply-chain benchmark spanning logistics collaboration, warehouse fulfillment, and finance/customs workflows with 530 annotated real-world samples.',
              'Designed a multi-stage data-construction pipeline with a heterogeneous multi-model generation framework, significantly improving QA quality over single-model data pipelines under expert review.',
              'Proposed SupChain-ReAct, which synthesizes execution procedures without manual SOPs through multi-path reasoning and voting; achieved the best tool-calling accuracy across 15+ mainstream LLMs.',
            ]}
          />
          <TimelineCard
            track="Research"
            title="VisualDeltas: Learning Preferences from Visual Quality-Induced Reasoning"
            location="Research Paper | 2025"
            points={[
              'Observed that VLM reasoning paths are highly sensitive to visual quality: the same question on high- versus low-resolution inputs can induce divergent reasoning behaviors that become supervision signals.',
              'Eliminated manual labels, external reward models, and larger teacher models by generating positive/negative preference pairs through controlled image-resolution degradation, then optimizing with DPO.',
              'On HiTab, WikiTQ, VQA, GQA, and MathVision, VD-S improved over baseline by up to +8.2%; compared with RFT, VisualDeltas generalized better across datasets while reducing overfitting risk.',
            ]}
          />
        </div>
      ),
    },
    {
      title: '2024',
      content: (
        <div className="space-y-4">
          <TimelineCard
            track="Internship"
            title="LLM Intern @ Microsoft Research Asia (MSRA)"
            location="Beijing, China | MC AI Group | 2024.09 — 2025.02"
            points={[
              'Contributed to one of the first GPT-4o production rollouts in M365 Copilot, focusing on LLM capability development and evaluation for email workflows.',
              'Designed a three-layer memory architecture for long-context degradation: external long-term memory (vector store + RAG), in-conversation progressive memory (summarized cache), and personalized user-preference modeling.',
              'Proposed a tree-structured retrieval method that maps documents to hierarchical section/paragraph coordinates and follows a "locate first, read continuously" path for more stable cross-paragraph reasoning.',
              'Built an LLM-based multi-turn evaluation framework covering intent understanding, task completion, and contextual consistency for automated end-to-end quality checks.',
            ]}
          />
          <TimelineCard
            track="Internship"
            title="Algorithm Intern @ Meituan"
            location="Beijing, China | 2024.05 — 2024.08"
            points={[
              'Independently led technical research and paper reproduction, delivering reusable algorithm implementations and engineering references.',
              'Addressed harmonic interference and divisor ambiguity in traffic-light countdown prediction using Fourier-based dominant-frequency extraction plus XGBoost/Random Forest ensemble forecasting.',
              'Improved prediction accuracy at 3s, 5s, and 10s horizons, providing more reliable timing signals for rider route planning.',
            ]}
          />
        </div>
      ),
    },
    {
      title: '2023',
      content: (
        <div className="space-y-4">
          <TimelineCard
            track="Education"
            title="National University of Singapore (NUS)"
            location="Singapore | 2023.08 — 2025.02"
            points={[
              'Statistics, Faculty of Science.',
              'QS Global Rank #8.',
              'GPA: 4.0 / 5.0 (Top 5% in major).',
            ]}
          />
          <TimelineCard
            track="Internship"
            title="Algorithm Intern @ Singapore AI Visual"
            location="Singapore | 2023.07 — 2023.12"
            points={[
              'Built a MobileNet-class lightweight CNN from scratch for multi-feature scalp microscopy detection (redness, dandruff, follicle blockage, etc.).',
              'Raised key feature-detection accuracy to 85%+ through data augmentation, loss tuning, and architecture iteration, improving overall accuracy by about 10% versus the baseline.',
              'Optimized quantization and inference acceleration for edge deployment, reducing per-image latency to under 150ms on a 2.4GHz CPU.',
            ]}
          />
        </div>
      ),
    },
    {
      title: '2022',
      content: (
        <div className="space-y-4">
          <TimelineCard
            track="Project / Competition"
            title="Kaggle Starfish Object Detection"
            location="2022.09 — 2022.12"
            points={[
              'The competition focused on efficient and accurate starfish detection in coral-reef underwater videos.',
              'Analyzed starfish image features (HOG and color histograms) and applied targeted image cropping, improving accuracy by roughly 30%.',
              'Combined sliding-window detection with non-maximum suppression (NMS) to produce more precise and reliable localization results.',
            ]}
          />
          <TimelineCard
            track="Project / Competition"
            title="AT&T TrackHack (US)"
            location="2022.02 — 2022.05"
            points={[
              'Initiated by AT&T, the project aimed to identify and serve low-income households eligible for a broadband subsidy program ($50/month).',
              'Built a binary classification pipeline under weak supervision with large unlabeled data and positive-only labeled samples.',
              'Combined PU learning, Random Forest, K-means, and RSFE; achieved a 0.94 F1 score and ranked in the top 10 among 500+ teams.',
            ]}
          />
        </div>
      ),
    },
    {
      title: '2019',
      content: (
        <div className="space-y-4">
          <TimelineCard
            track="Education"
            title="University of New South Wales (UNSW)"
            location="Sydney, Australia | 2019.09 — 2022.12"
            points={[
              'Computer Science and Technology.',
              'QS Global Rank #19.',
              'GPA: 85 / 100 (Top 3% in major).',
              'Academic Scholarship recipient and Dean List (2019–2022).',
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f5f8fc_42%,#f8fafc_100%)] pt-24 pb-16 lg:pt-28 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[8%] h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-[28%] right-[2%] h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            {aboutProfile.title}
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600 leading-relaxed">
            {aboutProfile.intro}
          </p>
          <p className="mt-3 max-w-2xl text-zinc-700 font-medium leading-relaxed">
            {aboutProfile.focus}
          </p>
        </div>

        <div className="mb-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aboutProfile.facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-zinc-200/90 bg-white/90 p-4 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.55)]">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500 mb-1.5">{fact.label}</p>
              <p className="font-semibold text-zinc-900">{fact.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
            Education & Experience Timeline
          </h2>
          <p className="mt-2 text-zinc-600">
            A detailed timeline of education, internships, full-time work, and key projects.
          </p>
        </div>

        <div className="mt-8">
          <Timeline data={timelineData} />
        </div>
      </div>
    </main>
  );
}
