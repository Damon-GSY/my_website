import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Capabilities from './components/sections/Capabilities';
import SystemShowcase from './components/sections/SystemShowcase';
import Work from './components/sections/Work';
import Journal from './components/sections/Journal';
import Contact from './components/sections/Contact';
import ScrollProgress from './components/ui/scroll-progress';
import FloatingWindow from './components/FloatingWindow';

const About = lazy(() => import('./components/About'));
const Projects = lazy(() => import('./components/Projects'));
const Blog = lazy(() => import('./components/Blog'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const Uses = lazy(() => import('./components/Uses'));
const NotFound = lazy(() => import('./components/NotFound'));

const agentOsChapters = [
  { id: 'capabilities', number: '01', shortLabel: 'CAP', label: 'Capabilities' },
  { id: 'control-surface', number: '02', shortLabel: 'CTL', label: 'Control' },
  { id: 'work', number: '03', shortLabel: 'WRK', label: 'Work' },
  { id: 'journal', number: '04', shortLabel: 'LOG', label: 'Journal' },
];

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

function HomePage() {
  const [activeChapter, setActiveChapter] = useState(agentOsChapters[0].id);

  useEffect(() => {
    const sections = agentOsChapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (activeEntry?.target.id) {
          setActiveChapter(activeEntry.target.id);
        }
      },
      {
        rootMargin: '-32% 0px -56% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeChapterIndex = agentOsChapters.findIndex(
    (chapter) => chapter.id === activeChapter,
  );

  return (
    <PageTransition>
      <Hero />
      <Marquee items={['Agent Systems', 'Agentic RL', 'Post-Training', 'Evaluation', 'Shipping']} speed={32} />
      <div className="agent-os-flow" data-compact-mobile-launcher>
        <div className="agent-os-frame">
          <aside
            className="agent-os-rail"
            aria-label="Agent OS sequence"
            data-chapter-index={activeChapterIndex}
          >
            <nav className="agent-os-rail-nav">
              <p className="sr-only">Agent OS sequence</p>
              <ol>
                {agentOsChapters.map((chapter, index) => {
                  const state =
                    index === activeChapterIndex
                      ? 'active'
                      : index === activeChapterIndex + 1
                        ? 'next'
                        : 'quiet';

                  return (
                    <li key={chapter.id} data-state={state}>
                      <a
                        href={`#${chapter.id}`}
                        aria-label={`${chapter.number} ${chapter.label}`}
                        aria-current={state === 'active' ? 'step' : undefined}
                      >
                        <span className="agent-os-rail-number">{chapter.number}</span>
                        <span className="agent-os-rail-label" aria-hidden="true">
                          {chapter.shortLabel}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>
          <div className="agent-os-sections">
            <Capabilities />
            <SystemShowcase />
            <Work />
            <Journal />
          </div>
        </div>
      </div>
      <Contact />
    </PageTransition>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <ScrollProgress />
      <Navbar />
      <main id="main-content">
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
              <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
              <Route path="/uses" element={<PageTransition><Uses /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <FloatingWindow />
    </Layout>
  );
}
