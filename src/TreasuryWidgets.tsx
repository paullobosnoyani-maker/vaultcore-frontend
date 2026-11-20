import React, { useState } from "react";
import { Copy, Check, Building2, BarChart3 } from "lucide-react";

function generateUniqueAccountNumber(seed: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  const clean = (seed || "vaultcore-default").toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const part1 = String(Math.abs(h1) % 900000 + 100000).padStart(6, "0");
  const part2 = String(Math.abs(h2) % 900000 + 100000).padStart(6, "0");
  return `88${part1.slice(0, 5)}${part2.slice(0, 5)}`;
}

export function VirtualAccountCard({ userEmail, userId }: { userEmail: string; userId?: string }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const virtualAccountNumber = generateUniqueAccountNumber(`${userId || ""}:${userEmail}`);

  const copyText = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Building2 className="w-4 h-4" />
            <span>US Commercial Checking Details</span>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">ACH &amp; Wire Ready</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Receive domestic US ACH transfers, payroll, and client wires directly into your Everyday Wallet.
        </p>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">ABA Routing Number</div>
            <div className="font-mono font-semibold text-slate-200">021000021</div>
          </div>
          <button onClick={() => copyText("routing", "021000021")} className="text-slate-400 hover:text-emerald-400 cursor-pointer">
            {copiedField === "routing" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Virtual Account Number</div>
            <div className="font-mono font-semibold text-slate-200">{virtualAccountNumber}</div>
          </div>
          <button onClick={() => copyText("account", virtualAccountNumber)} className="text-slate-400 hover:text-emerald-400 cursor-pointer">
            {copiedField === "account" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-between text-xs text-slate-500 pt-1 px-1">
          <span>Beneficiary: {userEmail}</span>
          <span>JPMorgan Chase / VaultCore</span>
        </div>
      </div>
    </div>
  );
}

export function CashFlowChart({ transactions }: { transactions: any[] }) {
  const inflows = transactions
    .filter((t) => parseFloat(t.amount) > 0)
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const outflows = transactions
    .filter((t) => parseFloat(t.amount) < 0)
    .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount)), 0);
  const maxVal = Math.max(inflows, outflows, 1);

  return (
    <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Treasury Cash-Flow Summary</span>
        </div>
        <p className="text-xs text-slate-400 mb-6">Verified inflows vs. disbursements across your ledger.</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Total Credits &amp; Funding Inflows</span>
            <span className="font-mono font-semibold text-emerald-400">+${inflows.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full h-3 bg-[#070B14] rounded-full overflow-hidden border border-slate-800/80">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(inflows / maxVal) * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Total Transfers &amp; ACH Outflows</span>
            <span className="font-mono font-semibold text-rose-400">-${outflows.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full h-3 bg-[#070B14] rounded-full overflow-hidden border border-slate-800/80">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${(outflows / maxVal) * 100}%` }} />
          </div>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Net Cash Position</span>
          <span className="font-mono font-bold text-slate-100 text-sm">
            ${(inflows - outflows).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
          </span>
        </div>
      </div>
    </div>
  );
}
