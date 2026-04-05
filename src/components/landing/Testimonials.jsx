import React from 'react';

const TestimonialCard = ({ quote, name, role, avatar }) => (
  <div className="bg-white rounded-[40px] p-10 flex flex-col justify-between shadow-xl transition-transform duration-300 hover:scale-[1.02]">
    <div>
      <div className="w-14 h-14 bg-[#111] rounded-full flex items-center justify-center text-white font-serif text-2xl italic mb-8 shadow-md">
        "
      </div>
      <p className="text-[#444] font-medium leading-relaxed text-[15px] mb-8">
        "{quote}"
      </p>
    </div>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <h4 className="font-bold text-[#111] tracking-tight">{name}</h4>
        <p className="text-xs font-semibold text-[#888] uppercase tracking-wide">{role}</p>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <div className="bg-[#f8f9fc] w-full px-8 py-32 font-sans relative">
      <div className="text-center max-w-[800px] mx-auto mb-20">
        <h2 className="text-5xl md:text-[56px] font-black text-[#111] tracking-[-0.04em] leading-tight">
          What our clients are<br />
          saying about us!
        </h2>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <TestimonialCard 
          quote="It's is both attractive and highly adaptable. It's exactly what I've been looking for definitely worth the investment."
          name="Hadid Khan"
          role="UI/UX Designer"
          avatar="https://i.pravatar.cc/150?u=4"
        />
        <TestimonialCard 
          quote="Great session! Dani was super helpful. She shared some practical advice on how can we go about refining our service offerings."
          name="Wade Warren"
          role="Web Designer"
          avatar="https://i.pravatar.cc/150?u=5"
        />
        <TestimonialCard 
          quote="I am really satisfied with it. I'm good to go. It really saves me time and effort. It's is exactly what our business has been lacking."
          name="Jenny Wilson"
          role="Trust Administrator"
          avatar="https://i.pravatar.cc/150?u=6"
        />
      </div>
    </div>
  );
}
