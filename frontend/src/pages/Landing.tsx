import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}