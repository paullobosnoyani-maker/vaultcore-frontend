import { SubPages } from "./SubPages";
import React, { useState } from "react";
import {
  ShieldCheck, ArrowRight, Lock, CheckCircle2,
  ChevronDown, Headphones, MessageSquare, X, Send
} from "lucide-react";

interface LandingProps {
  onOpenAuth: (isLoginMode: boolean) => void;
}

export function LandingPage({ onOpenAuth }: LandingProps) {
  const [activePage, setActivePage] = useState<string>(() => window.location.pathname.replace("/", "") || "home");
  const navigateTo = (page: string) => {
    setActivePage(page);
    setActiveMenu(null);
    window.history.pushState({}, "", page === "home" ? "/" : `/${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [activeMenu, setActiveMenu] = useState<"products" | "solutions" | "resources" | null>(null);
  const [selectedAcct, setSelectedAcct] = useState<"operating" | "payroll" | "taxes" | "treasury">("operating");
  const [calcBalance, setCalcBalance] = useState(250000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "Welcome to VaultCore US Private Desk. Ask us about partner-bank custody, FDIC sweep eligibility, variable treasury APY terms, or CIP/KYB onboarding.",
    },
  ]);

  const sampleAccounts = {
    operating: { label: "Operating Checking", balance: "$248,500.00", routing: "021000021", acct: "••••4821", note: "Primary ACH & vendor clearing" },
    payroll: { label: "Payroll Clearing", balance: "$150,180.00", routing: "021000021", acct: "••••4829", note: "Ring-fenced bi-weekly payroll" },
    taxes: { label: "IRS Tax Reserve", balance: "$84,056.00", routing: "021000021", acct: "••••4834", note: "Automated quarterly EFTPS allocation" },
    treasury: { label: "Treasury Sweep", balance: "$285,113.24", routing: "021000021", acct: "••••4890", note: "Earning 4.85% variable APY (as of Nov 2026)" },
  };

  const estAnnualYield = (calcBalance * 0.0485).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const estMonthlyYield = ((calcBalance * 0.0485) / 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePublicChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput;
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setChatInput("");
    setTimeout(() => {
      let reply = "Our New York onboarding desk is available Monday–Friday, 8:00 AM–7:00 PM EST. Click Apply Now to begin your CIP application.";
      if (q.toLowerCase().includes("fdic")) {
        reply = "VaultCore is a financial technology company, not a bank. Eligible deposits are held at our FDIC-insured partner banks and may qualify for up to $2.5M in pass-through FDIC coverage via our sweep network.";
      } else if (q.toLowerCase().includes("apy") || q.toLowerCase().includes("yield")) {
        reply = "The 4.85% APY is a variable rate accurate as of November 15, 2026, applicable to qualifying Treasury balances over $50,000. Rates may change at any time.";
      }
      setMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    }, 500);
  };
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-rose-800 selection:text-white font-sans">
      <div className="bg-slate-950 text-slate-300 text-[11px] py-2 px-6 text-center">
        VaultCore is a financial technology company, not a bank. Banking services provided by our FDIC-insured partner banks. &bull; Variable Treasury Yield: <span className="text-rose-400 font-semibold">4.85% APY*</span> (as of Nov 15, 2026)
      </div>

      <nav className="border-b border-white/10 bg-[#081021]/95 backdrop-blur sticky top-0 z-50 text-white" onMouseLeave={() => setActiveMenu(null)}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { navigateTo("home"); setActiveMenu(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <div className="w-9 h-9 rounded-lg bg-rose-700 flex items-center justify-center text-white shadow"><ShieldCheck className="w-5 h-5" /></div>
              <span className="font-bold text-xl tracking-tight text-white">VaultCore <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest">US</span></span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
              {([
                { id: "products", label: "Banking & Products", page: "banking" },
                { id: "solutions", label: "Solutions", page: "solutions" },
                { id: "resources", label: "Infrastructure & Security", page: "infrastructure" },
              ] as const).map((menu) => (
                <button key={menu.id} type="button" onMouseEnter={() => setActiveMenu(menu.id)} onClick={() => navigateTo(menu.page)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition cursor-pointer ${activeMenu === menu.id ? "bg-white text-slate-950" : "text-slate-300 hover:text-white hover:bg-white/10"}`}>
                  <span>{menu.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMenu === menu.id ? "rotate-180 text-rose-800" : ""}`} />
                </button>
              ))}
              <button type="button" onMouseEnter={() => setActiveMenu(null)} onClick={() => navigateTo("comparison")} className="px-3.5 py-2 text-slate-300 hover:text-white">Compare</button>
              <button type="button" onMouseEnter={() => setActiveMenu(null)} onClick={() => navigateTo("faq")} className="px-3.5 py-2 text-slate-300 hover:text-white">FAQ</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => onOpenAuth(true)} className="text-xs sm:text-sm font-semibold text-white border border-white/20 hover:bg-white/10 px-4 py-2 rounded-lg cursor-pointer">Sign in</button>
            <button onClick={() => onOpenAuth(false)} className="bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg cursor-pointer">Open Account</button>
          </div>
        </div>

        {activeMenu && (
          <div className="bg-white text-slate-900 border-t border-slate-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {activeMenu === "products" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Treasury</div>
                    <a href="#banking" onClick={(e) => { e.preventDefault(); navigateTo("banking"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Business Checking &amp; Sub-Wallets</div><div className="text-xs text-slate-500 mt-0.5">Segregated operating, payroll &amp; tax accounts</div></a>
                    <a href="#treasury" onClick={(e) => { e.preventDefault(); navigateTo("treasury"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">4.85% APY* Treasury Sweep</div><div className="text-xs text-slate-500 mt-0.5">Variable yield on qualifying idle reserves</div></a>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Spend &amp; Cards</div>
                    <a href="#cards" onClick={(e) => { e.preventDefault(); navigateTo("cards"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Commercial Visa&reg; Cards</div><div className="text-xs text-slate-500 mt-0.5">Titanium &amp; virtual cards with hard spend caps</div></a>
                    <a href="#banking" onClick={(e) => { e.preventDefault(); navigateTo("banking"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Same-Day ACH &amp; Fedwire&reg;</div><div className="text-xs text-slate-500 mt-0.5">$0 standard domestic ACH &amp; vendor auto-pay</div></a>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Growth Financing</div>
                    <a href="#capital" onClick={(e) => { e.preventDefault(); navigateTo("capital"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">US Business Grants &amp; Capital</div><div className="text-xs text-slate-500 mt-0.5">$10K–$250K non-dilutive &amp; working capital lines</div></a>
                  </div>
                </div>
              )}
                            {activeMenu === "solutions" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By Company Size</div>
                    <button onClick={() => { setActiveMenu(null); navigateTo("solutions"); }} className="w-full text-left block p-3 rounded-xl hover:bg-slate-50 cursor-pointer"><div className="font-bold text-sm text-slate-950">Startups &amp; Venture-Backed</div><div className="text-xs text-slate-500 mt-0.5">Extend runway with 4.85% APY* &amp; instant virtual cards</div></button>
                    <button onClick={() => { setActiveMenu(null); navigateTo("solutions"); }} className="w-full text-left block p-3 rounded-xl hover:bg-slate-50 cursor-pointer"><div className="font-bold text-sm text-slate-950">Mid-Sized &amp; Multi-Entity</div><div className="text-xs text-slate-500 mt-0.5">Dual-control approvals &amp; CSV audit statements</div></button>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By Industry</div>
                    <a href="#banking" onClick={(e) => { e.preventDefault(); navigateTo("banking"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Technology &amp; SaaS</div><div className="text-xs text-slate-500 mt-0.5">Cloud infrastructure cards &amp; automated GL tagging</div></a>
                    <a href="#capital" onClick={(e) => { e.preventDefault(); navigateTo("capital"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Logistics &amp; Supply Chain</div><div className="text-xs text-slate-500 mt-0.5">High-volume ACH vendor payouts &amp; inventory grants</div></a>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accounting &amp; Tax</div>
                    <button type="button" onMouseEnter={() => setActiveMenu(null)} onClick={() => navigateTo("faq")} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">CPA &amp; Auditor Access</div><div className="text-xs text-slate-500 mt-0.5">Read-only ledger roles &amp; IRS 1099-INT vault</div></button>
                  </div>
                </div>
              )}

              {activeMenu === "resources" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custody &amp; Coverage</div>
                    <a href="#infrastructure" onClick={(e) => { e.preventDefault(); navigateTo("infrastructure"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Partner-Bank Architecture</div><div className="text-xs text-slate-500 mt-0.5">How custodial accounts &amp; $2.5M FDIC sweep work</div></a>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security &amp; Governance</div>
                    <a href="#security" onClick={(e) => { e.preventDefault(); navigateTo("security"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">Double-Entry &amp; Encryption</div><div className="text-xs text-slate-500 mt-0.5">AES-256, TLS 1.3 &amp; CIP/BSA compliance controls</div></a>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organization</div>
                    <a href="#company" onClick={(e) => { e.preventDefault(); navigateTo("company"); navigateTo("home"); setActiveMenu(null); window.scrollTo(0, 0); }} className="block p-3 rounded-xl hover:bg-slate-50"><div className="font-bold text-sm text-slate-950">About VaultCore US</div><div className="text-xs text-slate-500 mt-0.5">New York headquarters, mission &amp; advisory desk</div></a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {activePage !== "home" ? (
        <SubPages page={activePage} onBack={() => navigateTo("home")} onOpenAuth={onOpenAuth} />
      ) : (
        <>


      <section className="relative bg-[#060C1A] text-white pt-16 pb-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(190,18,60,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(30,58,138,0.35),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="text-amber-400 font-bold">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span>Rated 4.9/5 by US Finance Teams</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.06] mb-5">
              Time is money. 
              <span className="text-rose-400">Save both.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              Commercial checking, EMV corporate cards, automated bill pay, 4.85% APY* treasury sweep, and double-entry accounting. All in one place.
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex items-center shadow-2xl max-w-md mb-5">
              <input
                type="email"
                placeholder="Enter your work email..."
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => onOpenAuth(false)}
                className="bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-lg shrink-0 shadow-lg shadow-rose-950/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Open Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5 mb-4 max-w-md">
              <div>
                <div className="text-sm font-bold text-white">Bank-Grade</div>
                <div className="text-[11px] text-slate-400">CIP &amp; OFAC Screened</div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">256-Bit TLS</div>
                <div className="text-[11px] text-slate-400">6-Digit OTP Protected</div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">24/7 Desk</div>
                <div className="text-[11px] text-slate-400">Real-Time Ledger</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              VaultCore is a financial technology company, not a bank. Banking services provided by FDIC-insured partner banks. Application subject to CIP/KYB approval.
            </p>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200/80 shadow-2xl p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Illustrative Sample Console &bull; Treasury Reporting</div>
                  <div className="text-xl font-bold text-slate-950 mt-0.5">Consolidated Spend &amp; Liquidity</div>
                </div>
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {(["operating", "payroll", "taxes", "treasury"] as const).map((k) => (
                    <button key={k} onClick={() => setSelectedAcct(k)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize cursor-pointer ${selectedAcct === k ? "bg-white text-rose-900 shadow-2xs" : "text-slate-600"}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-500">{sampleAccounts[selectedAcct].label}</div>
                  <div className="text-lg font-bold font-mono text-slate-950 mt-0.5">{sampleAccounts[selectedAcct].balance}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-500">30-Day Card Spend</div>
                  <div className="text-lg font-bold font-mono text-rose-800 mt-0.5">$42,180.00</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-500">Yield Rate (Variable*)</div>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">4.85% APY</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Departmental Cash-Flow &amp; Treasury Trajectory (Sample)</span>
                  <span className="font-mono text-emerald-700 font-semibold">+18.4% MoM</span>
                </div>
                <svg viewBox="0 0 400 95" className="w-full h-24 overflow-visible">
                  <defs>
                    <linearGradient id="vcFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9f1239" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#9f1239" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q60,72 110,58 T220,42 T310,24 T400,10 L400,95 L0,95 Z" fill="url(#vcFill)" />
                  <path d="M0,80 Q60,72 110,58 T220,42 T310,24 T400,10" fill="none" stroke="#9f1239" strokeWidth="2.5" />
                  <path d="M0,88 Q70,82 140,74 T270,62 T400,48" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
              </div>
            </div>

            <div className="hidden sm:flex items-end gap-4 mt-4 lg:-mt-10 lg:ml-6 relative z-10">
              <div className="w-64 rounded-2xl bg-gradient-to-br from-[#1C202B] via-[#101218] to-[#310A16] border border-slate-700 p-4 text-white shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">VaultCore</span>
                  <span className="text-xs font-black italic">VISA</span>
                </div>
                <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 mb-4" />
                <div className="font-mono text-xs tracking-widest text-slate-200 mb-2">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 9084</div>
                <div className="text-[9px] text-slate-400 uppercase">Commercial Titanium Card</div>
              </div>

              <div className="w-56 bg-slate-950 border-2 border-slate-800 rounded-2xl p-3.5 text-white shadow-2xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800 mb-2.5">
                  <span className="font-bold text-white">VaultCore Mobile</span>
                  <span className="text-emerald-400">&bull; Live</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="bg-white/5 rounded-lg p-2 flex justify-between">
                    <span className="text-slate-300">AWS Cloud</span>
                    <span className="font-mono text-rose-400">-$340.00</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 flex justify-between">
                    <span className="text-slate-300">Stripe Payout</span>
                    <span className="font-mono text-emerald-400">+$14,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-1.5">256-Bit Encrypted Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every ACH transfer, card authorization, and internal sub-wallet allocation is protected by TLS 1.3 encryption and 6-digit Email OTP verification.
            </p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-1.5">Credit &amp; Grant Reserve</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ring-fence non-dilutive grant capital and working credit lines in dedicated USD reserve accounts with automated audit trails.
            </p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-1.5">Custodial Partner Safety</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Client funds are held in segregated custodial accounts at regulated US partner banks, never commingled with corporate operating balances.
            </p>
          </div>
        </div>
      </section>

      <section id="infrastructure" className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">01 &bull; Banking Infrastructure &amp; Custody</div>
            <h2 className="text-3xl font-bold text-slate-950 mb-4">Transparent Partner-Bank Custody &amp; Sweep Mechanics</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              VaultCore provides the software, sub-ledger orchestration, and payment controls. Customer USD deposits are held directly in custodial accounts at regulated, FDIC-insured US partner banks—never commingled with VaultCore corporate operating funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-6">
              <div className="text-xs font-bold text-rose-800 uppercase mb-2">Custodial Partner Banks</div>
              <h3 className="text-base font-bold text-slate-950 mb-2">Segregated Deposit Accounts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Checking and reserve deposits are held at our US partner banks, Members FDIC. Standard FDIC insurance covers up to $250,000 per depositor, per insured bank, for each account ownership category.
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-6">
              <div className="text-xs font-bold text-rose-800 uppercase mb-2">Multi-Bank Sweep Network</div>
              <h3 className="text-base font-bold text-slate-950 mb-2">Up to $2.5M Pass-Through Coverage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligible enrolled balances above $250,000 may be automatically swept across up to 10 participating FDIC-insured program banks. Pass-through coverage is subject to FDIC rules, sweep bank availability, and accurate beneficial ownership records.
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-6">
              <div className="text-xs font-bold text-rose-800 uppercase mb-2">Direct Clearing Rails</div>
              <h3 className="text-base font-bold text-slate-950 mb-2">NACHA ACH &amp; Fedwire&reg; Settlement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every approved business account receives dedicated US ABA routing and account numbers for domestic ACH batches, payroll clearing, and Fedwire transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="banking" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">02 &bull; Business Banking</div>
            <h2 className="text-3xl font-bold text-slate-950 mb-4">Multi-Account Cash Management Built for Control</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Organize operating expenses, payroll obligations, tax reserves, and grant disbursements into separate sub-accounts—each governed by atomic double-entry ledger rules.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" /><span><strong>$0.00 Standard Domestic ACH:</strong> Applies to standard online domestic ACH debits and credits. Expedited same-day wires, international SWIFT wires, or returned-item fees may incur separate schedule charges.</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" /><span><strong>Instant Internal Rebalancing:</strong> Move liquidity between Operating, Savings, and Reserve sub-accounts 24/7 with immediate ledger settlement.</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" /><span><strong>Beneficiary Address Book &amp; Auto-Pay:</strong> Store verified US vendor routing details and schedule recurring payroll or IRS tax disbursements.</span></li>
            </ul>
          </div>

          <div id="cards" className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">03 &bull; Corporate Cards</div>
            <h3 className="text-2xl font-bold text-slate-950 mb-3">Granular Spend Controls on Every Card</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Issue virtual commercial cards for software subscriptions, cloud infrastructure, and department leads without sharing primary account numbers.
            </p>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div><div className="font-bold text-slate-900">Programmable Monthly Spend Caps</div><div className="text-slate-500">Automatically decline charges exceeding preset department budgets</div></div>
                <span className="text-rose-800 font-semibold">Enforced</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div><div className="font-bold text-slate-900">One-Click Freeze &amp; Virtual Card Rotation</div><div className="text-slate-500">Lock compromised vendor cards immediately from your console</div></div>
                <span className="text-rose-800 font-semibold">Real-Time</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div><div className="font-bold text-slate-900">GL Code Mapping &amp; CSV Audit Export</div><div className="text-slate-500">Tag every ledger entry for streamlined CPA reconciliation</div></div>
                <span className="text-rose-800 font-semibold">Audit-Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="treasury" className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">04 &bull; Treasury &amp; Cash Yield</div>
            <h2 className="text-3xl font-bold text-slate-950 mb-3">Variable-Rate Treasury Yield Estimator</h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Put idle operating reserves to work while preserving liquidity. Treasury yield is calculated daily on settled end-of-day qualifying balances over $50,000 and credited on the 1st business day of each month.
            </p>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase text-slate-500">Illustrative Qualifying Balance (USD)</span>
              <span className="text-2xl font-bold font-mono text-rose-800">${calcBalance.toLocaleString("en-US")}</span>
            </div>
            <input type="range" min={50000} max={2000000} step={25000} value={calcBalance} onChange={(e) => setCalcBalance(Number(e.target.value))} className="w-full accent-rose-800 cursor-pointer mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Estimated Monthly Accrual (at 4.85% APY*)</div>
                <div className="text-2xl font-bold text-slate-950 font-mono mt-1">+${estMonthlyYield} / mo</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Projected Annualized Yield (Illustrative)</div>
                <div className="text-2xl font-bold text-rose-800 font-mono mt-1">+${estAnnualYield} / yr</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              *Rate Disclosure: 4.85% Annual Percentage Yield (APY) is a variable rate accurate as of November 15, 2026, and is subject to change without prior notice based on Federal Reserve target rate adjustments and partner bank program terms. Minimum $50,000 settled reserve balance required to earn the advertised tier rate. Projections shown are illustrative estimates and not a guarantee of future earnings.
            </p>
          </div>
        </div>
      </section>

      <section id="capital" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">05 &bull; Capital &amp; Grants</div>
            <h3 className="text-2xl font-bold text-slate-950 mb-3">Growth Capital &amp; Business Grant Programs</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Verified US entities in good standing can apply directly from their dashboard for working capital lines or non-dilutive small-business expansion grants ($10,000 to $250,000).
            </p>
            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <div><strong>Eligibility:</strong> Active US-registered LLC, C-Corp, or S-Corp with verified EIN, beneficial ownership CIP, and 3+ months of operating ledger activity.</div>
              <div><strong>Underwriting &amp; Disbursement:</strong> Reviewed by VaultCore credit underwriters within 1–3 business days. Approved funds disburse into your segregated Grant &amp; Loan Reserve wallet.</div>
            </div>
          </div>

          <div id="security" className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">06 &bull; Security &amp; Governance</div>
            <h3 className="text-2xl font-bold text-slate-950 mb-3">Institutional Controls &amp; Ledger Integrity</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Engineered with defense-in-depth cryptographic security, role-based access controls, and an append-only double-entry database architecture.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5"><div className="font-bold text-slate-900">AES-256 &amp; TLS 1.3</div><div className="text-slate-500 mt-0.5">Encryption at rest &amp; in transit</div></div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5"><div className="font-bold text-slate-900">Immutable Double-Entry</div><div className="text-slate-500 mt-0.5">ACID ledger with full audit trail</div></div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5"><div className="font-bold text-slate-900">Dual-Control Approvals</div><div className="text-slate-500 mt-0.5">Role-isolated admin &amp; CPA access</div></div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5"><div className="font-bold text-slate-900">BSA / AML &amp; CIP Screening</div><div className="text-slate-500 mt-0.5">OFAC &amp; identity verification</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="comparison" className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">07 &bull; Platform Comparison</div>
          <h2 className="text-3xl font-bold text-slate-950 mb-8">VaultCore US vs. Legacy Commercial Checking</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr><th className="px-6 py-4">Capability</th><th className="px-6 py-4 text-rose-800 font-bold">VaultCore US</th><th className="px-6 py-4 text-slate-400">Traditional Commercial Banks</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr><td className="px-6 py-4 font-medium">Treasury Yield on Qualifying Reserves*</td><td className="px-6 py-4 text-rose-800 font-bold">4.85% APY (Variable)</td><td className="px-6 py-4 text-slate-400">0.01% &ndash; 0.05% APY</td></tr>
                <tr><td className="px-6 py-4 font-medium">Standard Domestic ACH Transfers</td><td className="px-6 py-4 text-rose-800 font-bold">$0.00 (Standard ACH)</td><td className="px-6 py-4 text-slate-400">$10 &ndash; $30 per batch/wire</td></tr>
                <tr><td className="px-6 py-4 font-medium">Multi-Bank FDIC Sweep Eligibility</td><td className="px-6 py-4 text-rose-800 font-bold">Up to $2.5M via Partner Network</td><td className="px-6 py-4 text-slate-400">$250,000 single-bank limit</td></tr>
                <tr><td className="px-6 py-4 font-medium">Segregated Sub-Wallets &amp; Virtual Cards</td><td className="px-6 py-4 text-rose-800 font-bold">Included at Account Opening</td><td className="px-6 py-4 text-slate-400">Additional monthly fees</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="company" className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">08 &bull; About VaultCore US</div>
            <h2 className="text-3xl font-bold mb-4">Engineered for Financial Transparency &amp; Speed</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Headquartered in New York, VaultCore Financial Technologies Inc. builds modern treasury, card-issuing, and capital management software for US businesses. We believe commercial banking should combine institutional bank-grade custody with real-time double-entry accounting precision.
            </p>
          </div>
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 text-xs space-y-2.5 text-slate-300">
            <div className="font-bold text-white text-sm">Corporate Headquarters</div>
            <div>228 Park Ave S, Suite 84910</div>
            <div>New York, NY 10003, United States</div>
            <div className="pt-2 text-rose-400 font-semibold">advisory@vaultcore.us</div>
          </div>
        </div>
      </section>
      <section id="faq" className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">09 &bull; Frequently Asked Questions</div>
          <h2 className="text-3xl font-bold text-slate-950 mb-8">Regulatory, Tax &amp; Operational FAQ</h2>
          <div className="space-y-3">
            {[
              {
                q: "Is VaultCore a chartered bank, and how is my money protected?",
                a: "VaultCore is a financial technology company, not an FDIC-insured bank. Banking services and custodial deposit accounts are provided by our FDIC-insured US partner banks. Eligible funds swept through our multi-bank sweep network qualify for up to $2.5M in pass-through FDIC coverage, subject to FDIC rules and bank participation."
              },
              {
                q: "How does the Start Application (~5 Mins) process work?",
                a: "Completing our online CIP/KYB form takes approximately 5 minutes. Once submitted, our compliance team and partner bank verify your business EIN, formation documents, and beneficial owner identity (SSN/DOB/address). Most applications receive a decision within 1–2 business days."
              },
              {
                q: "How is the 4.85% APY calculated, and are there exceptions?",
                a: "4.85% APY is a variable rate accurate as of November 15, 2026, earned on settled Treasury Reserve balances of $50,000 or more. Interest accrues daily based on end-of-day settled balances and is credited monthly. Rates are variable and subject to change."
              },
              {
                q: "Are there any fees on domestic ACH transfers or wires?",
                a: "Standard domestic ACH transfers initiated online carry $0.00 platform fees. Exceptions include expedited same-day Fedwires, international SWIFT transfers, and returned/rejected ACH items, which are disclosed in our commercial fee schedule prior to initiation."
              },
              {
                q: "Does VaultCore issue IRS Form 1099-INT for treasury yield?",
                a: "Yes. Any US entity earning $10.00 or more in annual treasury yield receives an IRS Form 1099-INT in January, downloadable directly from your Statements & Tax Vault."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#F9FAFB] border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-sm text-slate-900 hover:text-rose-800 cursor-pointer">
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-rose-800 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 pt-3">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      
        </>
      )}

      <footer className="border-t border-slate-200 bg-[#F9FAFB] py-14 px-6">
        <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
              <Lock className="w-4 h-4 text-rose-800" />
              <span>VaultCore Financial Technologies Inc. &bull; New York, NY</span>
            </div>
            <div className="flex flex-wrap gap-6 font-semibold text-slate-600">
              <a href="#infrastructure" className="hover:text-rose-800">Banking Disclosures</a>
              <a href="#security" className="hover:text-rose-800">Security &amp; CIP</a>
              <button type="button" onClick={() => navigateTo("fees")} className="hover:text-rose-800 cursor-pointer">Fee Schedule</button>
              <button type="button" onClick={() => navigateTo("terms")} className="hover:text-rose-800 cursor-pointer">Terms of Service</button>
              <button type="button" onClick={() => navigateTo("privacy")} className="hover:text-rose-800 cursor-pointer">Privacy Policy</button>
              <button type="button" onClick={() => navigateTo("esign")} className="hover:text-rose-800 cursor-pointer">E-Sign Consent</button>
              <button onClick={() => setChatOpen(true)} className="hover:text-rose-800 cursor-pointer">Contact Support</button>
            </div>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-500">
            Important Legal &amp; Regulatory Disclosures: VaultCore Financial Technologies Inc. (&ldquo;VaultCore&rdquo;) is a financial technology company and is not an FDIC-insured bank. Banking services and custodial deposit accounts are provided by VaultCore&apos;s FDIC-insured US partner banks. FDIC deposit insurance covers the failure of an insured bank; pass-through FDIC insurance coverage up to $2.5M requires deposit sweep enrollment and is subject to satisfaction of FDIC pass-through conditions. The VaultCore Commercial Card is issued by our partner issuing bank, Member FDIC, pursuant to a license from Visa U.S.A. Inc. All figures, account balances, and yield projections displayed on this public website are illustrative sample data.
          </p>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2.5 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-5 py-3.5 rounded-full shadow-xl transition cursor-pointer">
            <Headphones className="w-5 h-5" />
            <span className="text-sm">24/7 US Private Desk</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-rose-900 px-4 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-sm"><MessageSquare className="w-4 h-4" /><span>VaultCore US Advisory Desk</span></div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${m.sender === "user" ? "bg-rose-800 text-white font-medium" : "bg-white border border-slate-200 text-slate-700"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handlePublicChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about FDIC sweep, APY, CIP..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-800" />
              <button type="submit" className="bg-rose-800 hover:bg-rose-900 text-white p-2 rounded-xl cursor-pointer"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
