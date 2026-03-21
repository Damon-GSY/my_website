import Layout from './components/Layout'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Topics from './components/Topics'
import About from './components/About'
import Blog from './components/Blog'
import Contact from './components/Contact'

function App() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <Topics />
      <About />
      <Blog />
      <Contact />
      <Footer />
    </Layout>
  )
}

export default App
