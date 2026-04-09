import { motion } from 'framer-motion';
import { ArrowLeft, Database, Shield, Lock, Activity, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import SEO from '../components/common/SEO';

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'collection',
      title: '1. What we collect',
      icon: <Database className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'We only collect the basic information needed to make your payments work safely. This includes things like your device type and IP address, which we use to help prevent fraud and keep the system running fast. We do not track what you do on other websites or use any sneaky tracking software.'
    },
    {
      id: 'financial',
      title: '2. Your money is safe',
      icon: <Activity className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'We never see, store, or share your bank passwords, PINs, or private bank details. ArcPay simply helps you create a payment link. The actual payment happens inside your own trusted bank app. This means we are completely blind to your bank balance or private financial info.'
    },
    {
      id: 'sharing',
      title: '3. No data selling',
      icon: <EyeOff className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'We have a very strict rule: we never sell or rent your information to advertisers or anyone else. We only share details with banks to make sure your payments are real. We will only share info with authorities if we are legally forced to by a court order.'
    },
    {
      id: 'security',
      title: '4. Bank-level Security',
      icon: <Lock className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'We use the same high-level security as banks to keep your data safe. Our systems are protected by strong firewalls and are constantly checked for any security risks. While we do our absolute best to keep everything safe, no system on the internet is 100% perfect, so we stay alert 24/7.'
    },
    {
      id: 'rights',
      title: '5. Your rights',
      icon: <Shield className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'You are in control of your info. You can ask us for a copy of your records or ask us to delete your account at any time. Just keep in mind that deleting your account will instantly stop any active payment links you have created.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden font-sans selection:bg-[#d4ff3f]/30">
      <SEO 
        title="Privacy Framework" 
        description="Learn how ArcPay uses advanced security to protect your payment information."
        url="https://pay.arcbyte.co/privacy-policy"
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
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter">PRIVACY</span>
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter outline-text">POLICY</span>
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/[0.03] bg-[#050505]/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={arcbyteLogo} alt="ArcByte" className="h-4 md:h-5 opacity-80" />
          <div className="hidden md:block w-[1px] h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]">Data Framework</span>
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
                <Shield className="w-4 h-4 text-[#d4ff3f]" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Effective Date: October 2024</span>
              </div>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] text-white break-words italic-center-balance leading-[0.85]">
                PRIVACY <br />
                <span className="text-[#d4ff3f]">POLICY</span>
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
                <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Data Integrity Office</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Submit formal DSP inquiries directly.</p>
              </div>
              <a 
                href="mailto:privacy@arcbyte.co" 
                className="px-6 py-3 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_#d4ff3f]/40 transition-all"
              >
                privacy@arcbyte.co
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
