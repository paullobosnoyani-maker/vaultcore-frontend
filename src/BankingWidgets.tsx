import React, { useState } from "react";
import {
  CreditCard, Eye, EyeOff, Lock, Unlock, MessageSquare,
  X, Send, Headphones, CalendarClock, ShieldAlert
} from "lucide-react";

export function VirtualDebitCard({ holderName }: { holderName: string }) {
  const [revealed, setRevealed] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCard = () => {
    navigator.clipboard.writeText("4532891044219084");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <CreditCard className="w-4 h-4 text-rose-800" />
          <span>VaultCore Commercial Visa&reg;</span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${frozen ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {frozen ? "FROZEN" : "ACTIVE • PHYSICAL & VIRTUAL"}
        </span>
      </div>

      <div className={`relative rounded-2xl p-6 text-white transition-all duration-300 overflow-hidden select-none ${frozen ? "bg-slate-800 opacity-75" : "bg-gradient-to-br from-[#1B1F2A] via-[#111319] to-[#2B0B14] shadow-xl border border-slate-700/80"}`}>
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-rose-600/15 blur-2xl pointer-events-none" />
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-rose-700 flex items-center justify-center text-[10px] font-black">V</div>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-200">VaultCore</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Commercial</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border border-amber-300/60 p-1 grid grid-cols-3 gap-0.5 shadow-inner">
            <div className="border-r border-b border-amber-800/40" />
            <div className="border-r border-b border-amber-800/40" />
            <div className="border-b border-amber-800/40" />
            <div className="border-r border-amber-800/40" />
            <div className="border-r border-amber-800/40" />
            <div />
          </div>
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 14.5A5 5 0 0 1 8.5 9.5" />
            <path d="M11.5 17A9 9 0 0 1 11.5 7" />
            <path d="M14.5 19.5A13 13 0 0 1 14.5 4.5" />
          </svg>
        </div>

        <div className="font-mono text-lg sm:text-xl tracking-[0.18em] text-slate-100 mb-5 drop-shadow">
          {revealed ? "4532  8910  4421  9084" : "••••  ••••  ••••  9084"}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Authorized Cardholder</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-slate-100 truncate max-w-[170px]">{holderName}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs">
              <div className="text-[9px] text-slate-400">VALID THRU</div>
              <div className="text-slate-100">08/29</div>
            </div>
            <div className="font-mono text-xs">
              <div className="text-[9px] text-slate-400">CVV</div>
              <div className="text-slate-100">{revealed ? "842" : "•••"}</div>
            </div>
            <div className="text-right pl-1">
              <div className="text-lg font-black italic tracking-tighter text-white leading-none">VISA</div>
              <div className="text-[8px] uppercase tracking-widest text-slate-400">Business</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 font-medium">Monthly Spend Limit</span>
            <span className="font-mono font-bold text-slate-900">$1,420.00 / $25,000.00</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-800 rounded-full" style={{ width: "6%" }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setRevealed(!revealed)} className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer">
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-rose-800" />}
            <span>{revealed ? "Hide" : "Reveal"}</span>
          </button>
          <button onClick={copyCard} className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer">
            <span>{copied ? "Copied!" : "Copy #"}</span>
          </button>
          <button onClick={() => setFrozen(!frozen)} className={`flex items-center justify-center gap-1.5 border py-2 rounded-xl text-xs font-semibold cursor-pointer ${frozen ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"}`}>
            {frozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{frozen ? "Unfreeze" : "Freeze"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduledBillsWidget() {
  const bills = [
    { vendor: "Amazon Web Services (AWS)", date: "Nov 28, 2026", amount: "$340.00", status: "Auto-Pay" },
    { vendor: "Gusto US Payroll Clearing", date: "Nov 30, 2026", amount: "$2,850.00", status: "Scheduled" },
    { vendor: "IRS EFTPS Tax Reserve", date: "Dec 15, 2026", amount: "$1,120.00", status: "Scheduled" },
  ];

  return (
    <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <CalendarClock className="w-4 h-4" />
          <span>Upcoming US ACH & Auto-Pay Obligations</span>
        </div>
        <span className="text-xs text-slate-500">3 Scheduled</span>
      </div>
      <div className="space-y-3">
        {bills.map((b, i) => (
          <div key={i} className="bg-[#070B14] border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-slate-200">{b.vendor}</div>
              <div className="text-xs text-slate-500">Due {b.date} • {b.status}</div>
            </div>
            <div className="font-mono font-semibold text-slate-200">{b.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupportChatWidget({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: `Welcome to VaultCore US Private Desk, ${userEmail}. How can our New York treasury team assist you with ACH wires, corporate cards, or grant underwriting today?`,
      time: "Just now",
    },
  ]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    const q = input.toLowerCase();
    setInput("");

    setTimeout(() => {
      let reply = "A dedicated US Treasury Specialist has received your inquiry (#VC-8492) and will follow up within 5 minutes. Is there an urgent wire reference you would like us to prioritize?";
      if (q.includes("ach") || q.includes("withdraw") || q.includes("wire")) {
        reply = "Domestic US ACH payouts submitted before 4:00 PM EST settle same-day via Fedwire/ACH. Standard outgoing ACH transfers carry $0 fees.";
      } else if (q.includes("grant") || q.includes("loan") || q.includes("kyc")) {
        reply = "Grant & Capital applications are underwritten within 24 business hours once your US SSN/EIN verification is complete. Approved funds disburse directly to your Grant & Loan Reserve.";
      } else if (q.includes("card") || q.includes("limit")) {
        reply = "Your VaultCore Commercial Visa carries a $25,000.00 monthly spend limit and can be frozen or un-frozen instantly from your Overview screen.";
      }
      setMessages((prev) => [...prev, { sender: "agent", text: reply, time: "Just now" }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-3.5 rounded-full shadow-2xl transition cursor-pointer"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-sm">24/7 Treasury Support</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-[#0D1322] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 flex items-center justify-between text-slate-950">
            <div className="flex items-center gap-2 font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>VaultCore US Concierge</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-black/10 p-1 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-[#070B14]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${m.sender === "user" ? "bg-emerald-500 text-slate-950 font-medium" : "bg-[#0D1322] border border-slate-800 text-slate-200"}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.sender === "user" ? "You" : "US Treasury Desk"} • {m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-[#0D1322] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ACH, cards, grants..."
              className="flex-1 bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-xl cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
