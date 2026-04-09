import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Link as LinkIcon, CheckCircle, ShieldAlert, Settings, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';

export default function Docs() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'generation',
      title: '1. Instant Link Generation',
      icon: <LinkIcon className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'ArcPay radically simplifies the issuance of secure UPI payment requests. To initiate a transaction, navigate to the Dashboard and input the required denomination into the cryptographic terminal. Within milliseconds, ArcPay computes a distinct, shareable VPA string linked to your underlying bank credentials. This link can be transmitted via SMS, email, or embedded as a QR payload in digital invoices. The generated URL bypasses conventional payment gateways, allowing your payer to directly authorize the ledger transfer within their native banking environment without intermediary delays.'
    },
    {
      id: 'settlement',
      title: '2. P2P Settlement & Verification',
      icon: <CheckCircle className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Because ArcPay functions as a non-custodial layer rather than a traditional financial depository, settlement speeds are strictly bound by the capabilities of the underlying NPCI network. In 99% of scenarios, liquidity is routed instantaneously to your designated bank account. ArcPay cannot artificially delay or escrow these funds. Transaction verification relies on immutable UPI Reference Numbers (UTR). Instruct your clients to retain their UTRs, as these cryptographic signatures serve as definitive proof-of-transit for any reconciliation requirements.'
    },
    {
      id: 'sentinel',
      title: '3. Zero-Trust Security Sentinel',
      icon: <ShieldAlert className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'The ArcPay framework integrates a proprietary module known as the Security Sentinel. Accessible via the Admin Dashboard, the Sentinel grants operators immediate, absolute control over platform stability. If an acute cyber-threat or API anomaly is detected, administrators can engage the "Global Access Block"—an emergency kill-switch that instantly freezes all API endpoints and severs external routing access to the payment terminals. This scorched-earth protocol ensures that fraudulent links cannot be successfully queried while active mitigation procedures are deployed.'
    },
    {
      id: 'admin',
      title: '4. Administrative Operations',
      icon: <Settings className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'The ArcPay Administration portal (`/admin/login`) is structurally isolated from the public ledger tools. From here, you possess granular control over platform aesthetics, active merchant terminals, and live telemetry. The Admin Dashboard also houses the "Maintenance Mode" toggle. Activating Maintenance Mode automatically redirects all public traffic to a secure hold screen, concealing the application interface while developers execute back-end improvements. Note: Legal and Documentation pages purposefully bypass these lockouts for compliance auditing.'
    },
    {
      id: 'troubleshooting',
      title: '5. Diagnostic Troubleshooting',
      icon: <HelpCircle className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Should a payment link fail to compute, ensure your local connectivity is stable and that your VPA configuration within the main database has not been structurally altered. Persistent network latency during link generation often indicates temporary throttling from the primary UPI grid. Under no circumstances should users attempt to aggressively retry failing mutations, as this may trigger automated anti-sybil defenses causing a temporary IP ban. If issues continue unabated, diagnostic logs should be escalated to your internal operations engineering unit.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden font-sans selection:bg-[#d4ff3f]/30">
      
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
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter">PLATFORM</span>
        <span className="text-[15vh] md:text-[25vh] font-black leading-none tracking-tighter outline-text">MANUAL</span>
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/[0.03] bg-[#050505]/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={arcbyteLogo} alt="ArcByte" className="h-4 md:h-5 opacity-80" />
          <div className="hidden md:block w-[1px] h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-[#d4ff3f]">Documentation</span>
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
                <BookOpen className="w-4 h-4 text-[#d4ff3f]" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Official Documentation : ArcPay Core</span>
              </div>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] text-white break-words italic-center-balance leading-[0.85]">
                USER <br />
                <span className="text-[#d4ff3f]">MANUAL</span>
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
                <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Technical Support Desk</h3>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Open a direct ticket with our engineering team.</p>
              </div>
              <a 
                href="mailto:support@arcbyte.co" 
                className="px-6 py-3 bg-[#d4ff3f] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_#d4ff3f]/40 transition-all"
              >
                support@arcbyte.co
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
