import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/data/projects';

gsap.registerPlugin(ScrollTrigger);

function WorkItem({ project, index }) {
  const itemRef = useRef(null);
  const isExternal = project.href.startsWith('http');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.work-num',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: itemRef.current, start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '.work-title',
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'power4.out',
          scrollTrigger: { trigger: itemRef.current, start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '.work-meta',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: itemRef.current, start: 'top 78%', once: true },
        }
      );
    }, itemRef);

    return () => ctx.revert();
  }, []);

  const Wrapper = isExternal ? 'a' : Link;
  const wrapperProps = isExternal
    ? { href: project.href, target: '_blank', rel: 'noreferrer' }
    : { to: project.href };

  return (
    <div ref={itemRef} className="border-b border-[var(--line)] last:border-b-0">
      <Wrapper {...wrapperProps} className="block py-10 md:py-16 group">
        <div className="grid grid-cols-12 gap-4 md:gap-8 items-start">
          <div className="col-span-2 md:col-span-1">
            <span className="work-num type-mono text-sm text-[var(--muted)] block">
              ({String(index + 1).padStart(2, '0')})
            </span>
          </div>

          <div className="col-span-10 md:col-span-7">
            <div className="overflow-hidden">
              <h3 className="work-title type-display text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[var(--text)] leading-[1.05] group-hover:text-[var(--primary)] transition-colors duration-500">
                {project.title}
              </h3>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 md:col-start-9">
            <p className="work-meta text-sm text-[var(--muted)] leading-relaxed mb-3">
              {project.description}
            </p>
            <div className="work-meta flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] border border-[var(--line)] rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-1 flex md:justify-end">
            <span className="work-meta text-2xl text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors group-hover:rotate-45 duration-300 inline-block">
              <ArrowUpRight className="h-6 w-6" />
            </span>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

export default function Work() {
  const sectionRef = useRef(null);
  const featured = projects.filter((p) => p.featured);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.work-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[var(--bg)] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="work-header mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
              (03) Selected Work
            </p>
            <h2 className="type-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--text)]">
              Featured projects
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-sm font-semibold text-[var(--text)] border-b border-[var(--text)] pb-0.5 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="border-t border-[var(--line)]">
          {featured.map((project, i) => (
            <WorkItem key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
