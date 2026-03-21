import { BentoGridWithFeatures } from '../ui/bento-grid';
import { projects } from '../../data/projects';

export default function Projects() {
  const features = projects.map((project) => ({
    ...project,
    content: (
      <div className="h-32 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center">
        <span className="text-2xl">{project.title?.charAt(0)}</span>
      </div>
    ),
  }));

  return (
    <section className="section bg-zinc-900" id="projects">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Projects
        </h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-2xl">
          Things I've built and am currently working on.
        </p>
        <BentoGridWithFeatures features={features} />
      </div>
    </section>
  );
}
