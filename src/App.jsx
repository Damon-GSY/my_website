import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import WhatIDo from './components/sections/WhatIDo';
import FeaturedProjects from './components/sections/FeaturedProjects';
import WritingPreview from './components/sections/WritingPreview';
import { BackgroundPathsCTA } from './components/ui/background-paths';
import Projects from './components/Projects';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Uses from './components/Uses';
import NotFound from './components/NotFound';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

function PageTransition({ children }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <WhatIDo />
      <FeaturedProjects />
      <WritingPreview />
      <BackgroundPathsCTA />
    </PageTransition>
  );
}

function App() {
  const location = useLocation();

  return (
    <Layout>
      <Navbar />
      <main id="main-content">
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
      </main>
      <Footer />
    </Layout>
  );
}

export default App;
