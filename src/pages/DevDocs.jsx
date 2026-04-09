import { motion } from 'framer-motion';
import { ArrowLeft, Code, Key, Cpu, Webhook, TerminalSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import arcbyteLogo from '../assets/arcbyte_logo_white_transparent.png';

export default function DevDocs() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'architecture',
      title: '1. REST API Architecture',
      icon: <Code className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'The ArcPay financial conduit exposes a highly predictable, resource-oriented REST API. All endpoints are rooted at `https://api.arcpay.network/v1/`. We explicitly enforce strict JSON payloads for both issuance and consumption. All programmatic responses, including fault geometries, utilize standard HTTP verbs (GET, POST, DELETE) alongside verbose semantic status codes. Our architecture relies strictly on TLS 1.3; any algorithmic request failing to negotiate this cryptographic standard will be instantly dropped at the edge routing layer to prevent downgrade vectors.'
    },
    {
      id: 'authentication',
      title: '2. Authentication & Bearer Tokens',
      icon: <Key className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Machine-to-machine authentication is executed via immutable, high-entropy API Keys instantiated from your ArcPay Developer Console. Every API request must include the `Authorization` header formatted strictly as `Bearer sk_live_YOUR_SECRET_KEY`. We mandate absolute key hygiene: secret keys hold destructive permissions. If our heuristic scanners detect an active `sk_live` key hardcoded within a public repository (e.g., GitHub), the key will be forcefully invalidated without prior consultation, and your deployment nodes will halt processing.'
    },
    {
      id: 'generation',
      title: '3. Algorithmic Link Generation',
      icon: <Cpu className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'To programmatically synthesize a payment terminal, execute a POST payload to `/v1/checkout/sessions`. Your schema must define `amount` (in absolute paise/cents to eliminate floating-point truncation), currency parameters, and cryptographic `metadata` tags for internal reconciliation. The API responds in under 45ms with an encrypted VPA string (`checkout_url`) alongside an orchestration ID. This URL mathematically binds the payment constraints to your underlying banking identity, ensuring that the final payer cannot tamper with the ledger denomination prior to authorization.'
    },
    {
      id: 'webhooks',
      title: '4. Webhook Orchestrations',
      icon: <Webhook className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'Due to the inherently asynchronous nature of UPI grid settlements, ArcPay utilizes HTTP POST webhooks to notify your backend infrastructure of localized state mutations. You must provision an active HTTPS endpoint within the Developer Console capable of sinking JSON payloads. When a transaction finalizes, we dispatch a `payment_intent.succeeded` event. Crucially, all webhook drops include an `Arc-Signature` header. You are mathematically required to verify this HMAC signature using your webhook signing secret prior to fulfilling any merchant logic, explicitly neutralizing replay attacks.'
    },
    {
      id: 'ratelimits',
      title: '5. Rate Limiting & Throttling',
      icon: <TerminalSquare className="w-5 h-5 text-[#d4ff3f]" />,
      content: 'To preserve grid stability and defend against algorithmic sybil attacks, ArcPay strictly enforces granular rate limiting. The standard production quota allows 100 state-mutating requests (POST/DELETE) per second, per allocated IP cluster. Exceeding this boundary will result in immediate `HTTP 429 Too Many Requests` responses. Response headers will explicitly define the `X-RateLimit-Reset` epoch timestamp. Aggressive, automated retry loops that bypass our exponential backoff algorithms will automatically trigger permanent WAF blacklisting.'
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
          
          {/* HERO TYPOGRAPHY */}
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
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Connect with our core platform engineers.</p>
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
