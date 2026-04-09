import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Scale, FileText, AlertTriangle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import SEO from '../components/common/SEO';

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: '1. The Agreement',
      icon: <Scale className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'By using ArcPay, you agree to follow these simple rules. These terms are a legal agreement between you and ArcByte Official. If you do not agree with all the rules here, please stop using ArcPay immediately.'
    },
    {
      id: 'services',
      title: '2. How it works',
      icon: <Zap className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'ArcPay is a tool that helps you send payment links. We are not a bank and we do not hold your money. All payments happen directly between you and your customers through your respective bank apps. We simply provide the secure connection to make that happen.'
    },
    {
      id: 'rules',
      title: '3. Simple Rules',
      icon: <AlertTriangle className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'You can only use ArcPay for legal business activities. Using it for anything illegal or banned by the bank is strictly prohibited. If we find any suspicious or illegal activity, we have the right to stop your service immediately and without warning.'
    },
    {
      id: 'liability',
      title: '4. Responsibility',
      icon: <ShieldCheck className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'We provide ArcPay "as-is" and do our best to keep it running smoothly. We are not responsible for bank downtimes, internet issues, or if you accidentally share your account details with others. Our goal is to provide a great tool, but we can\'t control everything that happens on the internet.'
    },
    {
      id: 'intellectual',
      title: '5. Ownership',
      icon: <FileText className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'All the code, designs, and logos belong to ArcByte Official. We give you a license to use our tools to get paid, as long as you follow these rules. You cannot copy or try to steal our code or designs.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden font-sans selection:bg-[#d4ff3f]/30">
      <SEO 
        title="Terms of Service" 
        description="Review the legal framework governing the use of ArcPay's payment infrastructure."
        url="https://pay.arcbyte.co/terms-and-conditions"
      />
      
      {/* EDITORIAL GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-12 h-full w-full">
          {[...Array(13)].map((_, i) => (
            <div key={i} className="border-r border-white/5 h-full" />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col justify-between py-[10vh]">
          <div className="h-[1px] w-full bg-white/5" />
          <div className="h-[1px] w-full bg-white/5" />
          <div className="h-[1px] w-full bg-white/5" />
        </div>
      </div>

      {/* MASSIVE BACKGROUND WATERMARK */}
      <div className="fixed -left-[5%] top-1/2 -translate-y-1/2 rotate-90 md:rotate-0 flex flex-col gap-0 select-none opacity-[0.03] pointer-events-none">
        <span className="text-[15vh] md:text-[30vh] font-black leading-none tracking-tighter">LEGAL</span>
        <span className="text-[15vh] md:text-[30vh] font-black leading-none tracking-tighter outline-text">TERMS</span>
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/[0.03] bg-[#050505]/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={arcbyteLogo} alt="ArcByte" className="h-4 md:h-5 opacity-80" />
          <div className="hidden md:block w-[1px] h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]">Legal Framework</span>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Return</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 flex flex-col px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-4xl mx-auto w-full space-y-16 md:space-y-24">
          
          {/* HERO TYPOGRAPHY */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-4 h-4 text-[#d4ff3f]" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Effective Date: October 2024</span>
              </div>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] text-white break-words italic-center-balance leading-[0.85]">
                TERMS & <br />
                <span className="text-[#d4ff3f]">CONDITIONS</span>
              </h1>
            </motion.div>
          </div>

          {/* DOCUMENT BODY */}
          <div className="space-y-12 w-full pb-20">
            {sections.map((section, index) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                    {section.title}
                  </h2>
                </div>
                
                <div className="pl-14 border-l border-white/[0.03] ml-5">
                  <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed tracking-wide">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 p-8 rounded-3xl bg-[#d4ff3f]/5 border border-[#d4ff3f]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Have Legal Questions?</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Contact our compliance team directly.</p>
              </div>
              <a 
                href="mailto:legal@arcbyte.co" 
                className="px-6 py-3 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_#d4ff3f]/40 transition-all"
              >
                legal@arcbyte.co
              </a>
            </motion.div>
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.05);
          color: transparent;
        }
        .italic-editorial {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          transform: skewX(-5deg);
        }
        @media (max-width: 768px) {
          .italic-editorial {
            transform: none;
          }
        }
      `}} />
    </div>
  );
}
