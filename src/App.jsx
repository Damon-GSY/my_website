import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import WhatIDo from './components/sections/WhatIDo';

function HomePage() {
  return (
    <>
      <Hero />
      <WhatIDo />
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
      </Routes>
      <Footer />
    </Layout>
  );
}

export default App;
