// React import not required with the new JSX transform
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import Search from '../components/Search';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <About/>
      <Features />
      <Search />
      <Footer />
    </div>
  );
}