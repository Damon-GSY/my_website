import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import WhatIDo from './components/sections/WhatIDo';

function App() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <WhatIDo />
      <About />
      <Footer />
    </Layout>
  );
}

export default App;
