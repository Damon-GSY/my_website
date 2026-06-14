import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Manifesto from './components/sections/Manifesto';
import Capabilities from './components/sections/Capabilities';
import Work from './components/sections/Work';
import Journal from './components/sections/Journal';
import Contact from './components/sections/Contact';
import ScrollProgress from './components/ui/scroll-progress';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';

const About = lazy(() => import('./components/About'));
const Projects = lazy(() => import('./components/Projects'));
const Blog = lazy(() => import('./components/Blog'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const Uses = lazy(() => import('./components/Uses'));
const NotFound = lazy(() => import('./components/NotFound'));

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

function PageTransition({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <Marquee
        items={['Agent Systems', 'Post-Training', 'Agentic RL', 'Evaluation', 'Production AI']}
        speed={35}
      />
      <Manifesto />
      <Capabilities />
      <Work />
      <Journal />
      <Contact />
    </PageTransition>
  );
}

function App() {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);
  const handlePreloaderComplete = useCallback(() => setShowPreloader(false), []);

  useEffect(() => {
    if (!showPreloader) return undefined;
    const fallback = window.setTimeout(() => setShowPreloader(false), 2200);
    return () => window.clearTimeout(fallback);
  }, [showPreloader]);

  return (
    <SmoothScroll>
      <Layout>
        {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
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
      </Layout>
    </SmoothScroll>
  );
}

export default App;
