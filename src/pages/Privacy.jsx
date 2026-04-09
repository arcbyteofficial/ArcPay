import { motion } from 'framer-motion';
import { ArrowLeft, Database, Shield, Lock, Activity, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'collection',
      title: '1. Granular Data Collection Scope',
      icon: <Database className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'ArcPay operates as a highly specialized, minimal-surface transit layer. We explicitly log device metadata (User-Agent, OS architecture), IP routing origins, geographic nodal approximations, and transaction initiation timestamps. This telemetry is harvested strictly for maintaining network health, optimizing latency, and executing advanced anti-fraud heuristics. Under no circumstances do we deploy persistent tracking cookies, pixel trackers, or behavioral analytics software intended to monitor your activity outside of the immediate ArcPay transactional ecosystem. You explicitly consent to this minimal, targeted telemetry necessary for secure operations.'
    },
    {
      id: 'financial',
      title: '2. Transit Integrity & Non-Custodial Data',
      icon: <Activity className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'ArcPay is engineered upon a fundamental zero-trust, non-custodial architecture. We unequivocally do not record, store, nor transmit your private banking credentials, UPI PINs, raw biometric authorization metrics, or persistent financial instruments. Generated payment strings (VPA deep-links) are publicly verifiable objects but remain fully enciphered during server generation to prevent man-in-the-middle vectoring. Final settlement and authorization occur entirely within the encrypted, localized boundaries of your chosen banking application, rendering ArcPay mathematically blind to your underlying liquidity.'
    },
    {
      id: 'sharing',
      title: '3. Third-Party Bridging & Disclosures',
      icon: <EyeOff className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Your transaction signatures and algorithmic node data are strictly compartmentalized within our proprietary databases. ArcByte Official maintains a scorched-earth policy against aggregate data commoditization: we do not sell, lease, or algorithmically distribute user metrics to third-party ad networks, marketing syndicates, or external data brokers. Network telemetry is strictly interfaced with verified banking APIs for routing validation. We will only disclose specific transaction payloads when presented with a legally binding subpoena, court order, or explicit regulatory mandate from federal oversight authorities (e.g., RBI, CERT-In, or FATF compliance bureaus).'
    },
    {
      id: 'security',
      title: '4. Cryptographic Security Standards',
      icon: <Lock className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'The ArcPay management dashboard and all associated payment nodes are secured utilizing military-grade TLS 1.3 encryption, ensuring perfect forward secrecy. System architecture is fortified behind aggressive web application firewalls (WAF) and active heuristic monitoring. Administrative data retrieval is heavily sandboxed, requiring multi-factor authentication (MFA) and IP-whitelisting for internal operators. While we guarantee adherence to state-of-the-art cryptographic standards, you acknowledge that no interconnected server node is entirely impervious to novel, nation-state level cyber vulnerabilities.'
    },
    {
      id: 'rights',
      title: '5. End-User Data Rights & Deletion',
      icon: <Shield className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'In accordance with progressive data sovereignty frameworks, users maintain explicit rights over their generated telemetry. You may request a complete cryptographic export of your ledger history or mandate the outright deletion of your merchant profile. However, be advised that requests for permanent account erasure will inherently nullify all active payment links and immediately shutter dashboard access. Note: Archival copies of specific transaction signatures may be retained in cold storage for up to 60 months exclusively to comply with international AML/KYC audit requirements.'
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
