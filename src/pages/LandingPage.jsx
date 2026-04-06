import React from 'react';
import Hero from '../components/landing/Hero';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black p-0 sm:p-4 md:p-6 lg:p-8 font-sans antialiased text-white selection:bg-teal-500/30">
      <div className="max-w-[1400px] mx-auto rounded-none sm:rounded-[40px] overflow-hidden shadow-2xl relative">
        <Hero />
      </div>
    </div>
  );
}
