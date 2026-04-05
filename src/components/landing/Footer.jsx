import React from 'react';
import { Camera, MessageCircle, Mail, Globe, ShieldCheck } from 'lucide-react';
import arcbyteLogo from '../../assets/arcbyte.co Logo_white_transparent.png';

export default function Footer() {
  return (
    <div className="bg-[#151518] w-full px-6 md:px-8 pt-16 md:pt-24 pb-8 font-sans">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12 mb-10 lg:mb-20 border-b border-white/10 pb-10 lg:pb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 pr-8">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-6">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] stroke-[2.5]" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ArcPay</span>
            <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-0.5 sm:mx-1"></div>
            <img src={arcbyteLogo} alt="ArcByte" className="h-5 sm:h-6 opacity-90 object-contain" />
          </div>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 max-w-[200px]">
            Discover the power of our secure and rewarding payment links
          </p>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors text-black">
              <Camera className="w-4 h-4" />
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors text-black font-serif italic font-bold">
              p
            </div>
            <div className="w-10 h-10 bg-[#0d6dfd] rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors text-white">
              <MessageCircle className="w-4 h-4" fill="currentColor" strokeWidth={0} />
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors text-black">
              <Globe className="w-4 h-4 stroke-[1.5]" />
            </div>
          </div>
        </div>


        {/* Links Column 1 */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-wide">About us</h4>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Investors</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Features</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Book a demo</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Security</a>
        </div>

        {/* Links Column 2 */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-wide">Products</h4>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Credits Cards</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Gift Cards</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Savings accounts</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">NFT</a>
        </div>

        {/* Links Column 3 */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-wide">Useful Links</h4>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Free rewards</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Affiliate program</a>
        </div>

        {/* Links Column 4 */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-wide">Social</h4>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Changelog</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">License</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">Site Maps</a>
          <a href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">News</a>
        </div>

      </div>

      <div className="text-center text-zinc-600 text-[13px] font-medium tracking-wide">
        @2024 Copy Right-ArcPay
      </div>
    </div>
  );
}
