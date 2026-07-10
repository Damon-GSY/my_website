import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Work from './components/sections/Work';
import ResearchPath from './components/sections/ResearchPath';
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
  return (
    <PageTransition>
      <Hero />
      <Work />
      <ResearchPath />
      <Journal />
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
