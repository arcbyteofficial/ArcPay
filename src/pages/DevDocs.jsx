import { motion } from 'framer-motion';
import { ArrowLeft, Code, Key, Cpu, Webhook, TerminalSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';
import SEO from '../components/common/SEO';

export default function DevDocs() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'setup',
      title: '1. Simple API Setup',
      icon: <Code className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'ArcPay provides a simple and reliable way to connect your system to ours. Use our API to create and manage payments easily. You can access all features at `https://api.arcpay.network/v1/`. We use clear data formats and standard web rules to ensure everything works smoothly. We also use the highest security standards to keep every request safe.'
    },
    {
      id: 'authentication',
      title: '2. Authentication & Bearer Tokens',
      icon: <Key className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Connect safely using unique security keys found in your settings. Every request needs a special code with your secret key. It is very important to keep your keys secret. If our security checks find a live key shown in public (like on GitHub), the key will be automatically disabled, and your system will stop processing payments for safety.'
    },
    {
      id: 'generation',
      title: '3. Creating Payment Links',
      icon: <Cpu className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'To create a payment link automatically, send a request to `/v1/checkout/sessions`. You should include the amount in paise (like 100 for ₹1) to ensure accuracy, and any extra notes you need. The system responds almost instantly with a payment link. This link is uniquely tied to your account and cannot be changed by anyone else.'
    },
    {
      id: 'webhooks',
      title: '4. Payment Notifications',
      icon: <Webhook className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Since UPI payments can take a moment to confirm, ArcPay sends an automatic message to your site as soon as the payment is done. Set up a safe address in your settings to receive these messages. Our system will tell you when a payment is successful. Always check the security signature we send to make sure the message is real and safe.'
    },
    {
      id: 'ratelimits',
      title: '5. Safe Usage Limits',
      icon: <TerminalSquare className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'To keep the system fast for everyone, we have fair usage limits. You can make up to 100 changes per second. If you go over this limit, you will see an error message. Please use our systems fairly; trying to bypass these limits may result in being blocked from the system.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden font-sans selection:bg-[#d4ff3f]/30">
      <SEO 
        title="Developer Hub" 
        description="Access simple API guides and integration manuals for your payment system."
        url="https://pay.arcbyte.co/developer"
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
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter">DEVELOPER</span>
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter outline-text">API DOCS</span>
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/[0.03] bg-[#050505]/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={arcbyteLogo} alt="ArcByte" className="h-4 md:h-5 opacity-80" />
          <div className="hidden md:block w-[1px] h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]">Integration Hub</span>
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
          
          {/* SEGMENT I: SYSTEM CONNECTION */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-4 h-4 text-[#d4ff3f]" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Engineering Payload v1.0</span>
              </div>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] text-white break-words italic-center-balance leading-[0.85]">
                DEVELOPER <br />
                <span className="text-[#d4ff3f]">API DOCS</span>
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
                <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Developer Relations</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Connect with our support team for any help.</p>
              </div>
              <a 
                href="mailto:developers@arcbyte.co" 
                className="px-6 py-3 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_#d4ff3f]/40 transition-all"
              >
                developers@arcbyte.co
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
