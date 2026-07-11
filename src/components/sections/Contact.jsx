import { Mail } from 'lucide-react';

const collaborationAreas = [
  'Agent systems and tool use',
  'Evaluation and benchmark design',
  'Post-training for real workflows',
  'Technical research and communication',
];

export default function Contact() {
  return (
    <section
      id="contact"
      data-hide-launcher
      className="border-t border-[var(--line)] py-20 md:py-28"
      aria-labelledby="contact-title"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 md:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] md:px-6">
        <div>
          <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--primary)]">
            05 / Contact
          </p>
          <h2
            id="contact-title"
            className="max-w-3xl font-display text-4xl font-normal leading-[0.98] tracking-[-0.045em] text-[var(--text)] md:text-6xl"
          >
            Good systems begin with a precise problem.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
            I am open to thoughtful collaborations where research quality and production
            constraints matter equally. If that describes the problem you are working on,
            write directly.
          </p>
          <a
            href="mailto:hello@damon.ai"
            className="mt-9 inline-flex items-center gap-3 border-b border-[var(--primary)] pb-2 font-display text-2xl text-[var(--text)] transition-colors hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] md:text-3xl"
          >
            <Mail className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            hello@damon.ai
          </a>
        </div>

        <div className="grid content-start gap-10 border-t border-[var(--line)] pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <div>
            <h3 className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--primary)]">
              Collaboration areas
            </h3>
            <ul className="mt-4 m-0 list-none p-0">
              {collaborationAreas.map((area) => (
                <li key={area} className="border-t border-[var(--line)] py-3 text-sm text-[var(--text)] first:border-t-0">
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <p className="max-w-sm border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--muted)]">
            Email is the confirmed contact channel for research, engineering,
            speaking, and technical collaboration enquiries.
          </p>
        </div>
      </div>
    </section>
  );
}
