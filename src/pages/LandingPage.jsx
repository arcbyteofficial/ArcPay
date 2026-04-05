import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Showcase from '../components/landing/Showcase';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] p-2 sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-teal-500/30">
      <div className="max-w-[1400px] mx-auto rounded-[40px] overflow-hidden shadow-2xl relative">
        <Hero />
        <Features />
        <Showcase />
        <Testimonials />
        <Footer />
      </div>
    </div>
  );
}
