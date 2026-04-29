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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
      <Footer />
    </Layout>
  );
}

export default App;
