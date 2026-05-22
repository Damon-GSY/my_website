import { Routes, Route } from 'react-router-dom';
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

function HomePage() {
  return (
    <>
      <Hero />
      <WhatIDo />
      <FeaturedProjects />
      <WritingPreview />
      <BackgroundPathsCTA />
    </>
  );
}

function App() {
  return (
    <Layout>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/uses" element={<Uses />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Layout>
  );
}

export default App;
