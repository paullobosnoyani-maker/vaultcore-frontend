import React, { useState } from "react";
import {
  CreditCard, Eye, EyeOff, Lock, Unlock, MessageSquare,
  X, Send, Headphones, CalendarClock
} from "lucide-react";

function generateUniqueVisaDetails(seed: string) {
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  const clean = (seed || "AUTHORIZED SIGNER").toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i * 7;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const p1 = String(Math.abs(h1) % 9000 + 1000);
  const p2 = String(Math.abs(h2) % 9000 + 1000);
  const p3 = String(Math.abs(h1 ^ h2) % 900 + 100);
  const base15 = `4532${p1}${p2}${p3}`;

  // Calculate valid Luhn check digit for the 16th digit
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(base15[14 - i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  const full16 = `${base15}${checkDigit}`;
  const last4 = full16.slice(12);
  const formatted = `${full16.slice(0, 4)}  ${full16.slice(4, 8)}  ${full16.slice(8, 12)}  ${last4}`;
  const masked = `••••  ••••  ••••  ${last4}`;

  const expMonth = String((Math.abs(h1) % 12) + 1).padStart(2, "0");
  const expYear = String(29 + (Math.abs(h2) % 3)); // 29, 30, or 31
  const cvv = String((Math.abs(h1 + h2) % 899) + 100);

  return { full16, formatted, masked, expiry: `${expMonth}/${expYear}`, cvv };
}

export function VirtualDebitCard({ holderName }: { holderName: string }) {
  const [revealed, setRevealed] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [copied, setCopied] = useState(false);

  const card = generateUniqueVisaDetails(holderName);

  const copyCard = () => {
    navigator.clipboard.writeText(card.full16);
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
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            frozen
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {frozen ? "FROZEN" : "ACTIVE • PHYSICAL & VIRTUAL"}
        </span>
      </div>

      <div
        className={`relative rounded-2xl p-6 text-white transition-all duration-300 overflow-hidden select-none ${
          frozen
            ? "bg-slate-800 opacity-75"
            : "bg-gradient-to-br from-[#1B1F2A] via-[#111319] to-[#2B0B14] shadow-xl border border-slate-700/80"
        }`}
      >
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-rose-600/15 blur-2xl pointer-events-none" />
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="VaultCore US"
              className="w-6 h-6 rounded object-contain bg-[#090D16] p-0.5 border border-white/10"
            />
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
          {revealed ? card.formatted : card.masked}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Authorized Cardholder</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-slate-100 truncate max-w-[170px]">
              {holderName}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs">
              <div className="text-[9px] text-slate-400">VALID THRU</div>
              <div className="text-slate-100">{card.expiry}</div>
            </div>
            <div className="font-mono text-xs">
              <div className="text-[9px] text-slate-400">CVV</div>
              <div className="text-slate-100">{revealed ? card.cvv : "•••"}</div>
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
            <span className="font-mono font-bold text-slate-900">$0.00 / $25,000.00</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-800 rounded-full" style={{ width: "2%" }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-rose-800" />}
            <span>{revealed ? "Hide" : "Reveal"}</span>
          </button>
          <button
            onClick={copyCard}
            className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <span>{copied ? "Copied!" : "Copy #"}</span>
          </button>
          <button
            onClick={() => setFrozen(!frozen)}
            className={`flex items-center justify-center gap-1.5 border py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              frozen
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"
            }`}
          >
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
          <span>Upcoming US ACH &amp; Auto-Pay Obligations</span>
        </div>
        <span className="text-xs text-slate-500">3 Scheduled</span>
      </div>
      <div className="space-y-3">
        {bills.map((b, i) => (
          <div key={i} className="bg-[#070B14] border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-slate-200">{b.vendor}</div>
              <div className="text-xs text-slate-500">
                Due {b.date} • {b.status}
              </div>
            </div>
            <div className="font-mono font-semibold text-slate-200">{b.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupportChatWidget({
  userEmail,
  wallets = [],
  recentTransactions = [],
  virtualAccountNumber = "",
}: {
  userEmail: string;
  wallets?: any[];
  recentTransactions?: any[];
  virtualAccountNumber?: string;
}) {

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    const q = input.toLowerCase();
    setInput("");

        setTimeout(() => {
      const fmt = (n: number) =>
        n.toLocaleString("en-US", { style: "currency", currency: "USD" });
      const totalUsd = wallets.reduce((sum: number, w: any) => sum + parseFloat(w.balance || "0"), 0);

      let reply = `I have live access to your VaultCore US profile (${userEmail}). Try asking:\n• "What is my balance?"\n• "Show my last 5 transactions"\n• "What is my routing & account number?"\n• "What is my monthly sweep yield?"`;

      if (
        q.includes("balance") ||
        q.includes("how much") ||
        q.includes("money") ||
        q.includes("total") ||
        q.includes("wallet")
      ) {
        if (wallets.length === 0) {
          reply = "No active accounts loaded yet. Click Sync at the top right to refresh your ledger.";
        } else {
          const breakdown = wallets
            .map((w: any) => `• ${w.account_name}: ${fmt(parseFloat(w.balance || "0"))}`)
            .join("\n");
          reply = `Your total VaultCore US liquidity is ${fmt(totalUsd)} USD:\n\n${breakdown}`;
        }
      }
      } else if (
        q.includes("transaction") ||
        q.includes("history") ||
        q.includes("recent") ||
        q.includes("last 5") ||
        q.includes("statement") ||
        q.includes("activity")
      ) {
        const last5 = recentTransactions.slice(0, 5);
        if (last5.length === 0) {
          reply = "You have no settled transactions on your ledger yet.";
        } else {
          const list = last5
            .map((tx: any, idx: number) => {
              const amt = parseFloat(tx.amount || "0");
              const sign = amt >= 0 ? "+" : "-";
              const date = tx.created_at
                ? new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Settled";
              return `${idx + 1}. ${tx.description || tx.transaction_type} (${date}): ${sign}${fmt(Math.abs(amt))}`;
            })
            .join("\n");
          reply = `Here are your ${last5.length} most recent settled transactions:\n\n${list}`;
        }
      } else if (q.includes("routing") || q.includes("aba") || q.includes("account number")) {
        reply = `Your VaultCore US domestic ACH & Fedwire credentials:\n• ABA Routing Number: 021000021\n• Virtual Account Number: ${virtualAccountNumber || "See Accounts & Routing"}\n• Custodial Bank: JPMorgan Chase / VaultCore US`;
      } else if (q.includes("yield") || q.includes("fdic") || q.includes("sweep")) {
        const monthlyYield = (totalUsd * 0.0485) / 12;
        reply = `Your USD deposits are swept across FDIC-insured partner banks up to $2,500,000 coverage, earning an estimated ${fmt(monthlyYield)}/mo at 4.85% APY.`;
      } else if (q.includes("ach") || q.includes("withdraw") || q.includes("wire")) {
        reply = "Domestic US ACH payouts submitted before 4:00 PM EST settle same-day via Fedwire/ACH. Standard outgoing ACH transfers carry $0 fees.";
      } else if (q.includes("grant") || q.includes("loan") || q.includes("kyc")) {
        reply = "Grant & Capital applications are underwritten within 24 business hours once your US SSN/EIN verification is complete. Approved funds disburse directly to your Grant & Loan Reserve.";
      } else if (q.includes("card") || q.includes("limit")) {
        reply = "Your VaultCore Commercial Visa carries a $25,000.00 monthly spend limit and can be frozen or un-frozen instantly from your Overview screen.";
      }

      setMessages((prev) => [...prev, { sender: "agent", text: reply, time: "Just now" }]);
    }, 500);


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
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-500 text-slate-950 font-medium"
                      : "bg-[#0D1322] border border-slate-800 text-slate-200"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {m.sender === "user" ? "You" : "US Treasury Desk"} • {m.time}
                </span>
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
