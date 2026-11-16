import React, { useState } from "react";
import { ShieldCheck, Download, TrendingUp, Users, UserPlus, BookUser, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export function FdicSweepWidget({ totalBalance }: { totalBalance: number }) {
  const monthlyYield = ((totalBalance * 0.0485) / 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sweepPct = Math.min(100, Math.round((totalBalance / 2500000) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>FDIC Sweep &amp; Treasury Yield</span>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            4.85% APY Active
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Your USD balances are automatically swept across 10+ FDIC-insured US partner banks for up to $2,500,000 in pass-through protection.
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Est. Monthly Treasury Yield</div>
            <div className="font-mono font-bold text-slate-950 text-base">+${monthlyYield} / mo</div>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>FDIC Sweep Utilization ($2.5M Cap)</span>
            <span className="font-mono font-semibold text-slate-700">${totalBalance.toLocaleString("en-US")} / $2.5M</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-800 rounded-full" style={{ width: `${Math.max(sweepPct, 3)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatementExportWidget({ user, transactions }: { user: any; wallets?: any[]; transactions: any[] }) {
  const [downloaded, setDownloaded] = useState(false);

  const exportCsv = () => {
    const rows = [
      ["Date", "Account", "Transaction Type", "Description", "Amount (USD)"].join(","),
      ...transactions.map((t) =>
        [new Date(t.created_at || Date.now()).toLocaleDateString(), t.account_name, t.transaction_type, t.description, t.amount].join(",")
      ),
    ].join(String.fromCharCode(10));
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VaultCore_US_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-rose-800" />
            <span>Official Statements &amp; Tax Vault</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Nov 2026</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Download audit-ready monthly ledger statements, IRS Form 1099-INT yield summaries, and bank verification letters for {user?.business_name || user?.email || "your entity"}.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">IRS Form W-9 &amp; Bank Verification Letter</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
        </div>
        <button
          onClick={exportCsv}
          className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-rose-900 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloaded ? "Statement Downloaded (CSV)" : "Export Monthly Ledger Statement (CSV)"}</span>
        </button>
      </div>
    </div>
  );
}


export function BeneficiariesWidget() {
  const [beneficiaries, setBeneficiaries] = useState([
    { name: "Amazon Web Services Inc.", bank: "Wells Fargo N.A.", routing: "121000248", acct: "••••4910", type: "ACH Vendor" },
    { name: "Gusto Payroll Clearing", bank: "JPMorgan Chase", routing: "021000021", acct: "••••8821", type: "Payroll" },
    { name: "Stripe Merchant Payouts", bank: "Evolve Bank & Trust", routing: "084106768", acct: "••••3019", type: "Treasury" },
  ]);
  const [newName, setNewName] = useState("");
  const [newBank, setNewBank] = useState("");

  const addVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBank) return;
    setBeneficiaries([...beneficiaries, { name: newName, bank: newBank, routing: "021000021", acct: "••••" + Math.floor(1000 + Math.random() * 9000), type: "Verified ACH" }]);
    setNewName("");
    setNewBank("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <BookUser className="w-4 h-4 text-rose-800" />
          <span>Verified US Wire &amp; ACH Beneficiaries</span>
        </div>
        <span className="text-xs text-slate-500">{beneficiaries.length} Saved</span>
      </div>

      <div className="space-y-2.5 mb-4">
        {beneficiaries.map((b, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900">{b.name}</div>
              <div className="text-slate-500">{b.bank} &bull; ABA {b.routing} ({b.acct})</div>
            </div>
            <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium">{b.type}</span>
          </div>
        ))}
      </div>

      <form onSubmit={addVendor} className="flex gap-2">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vendor name..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-800" />
        <input type="text" value={newBank} onChange={(e) => setNewBank(e.target.value)} placeholder="US Bank..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-800" />
        <button type="submit" className="bg-rose-800 hover:bg-rose-900 text-white font-semibold px-3.5 py-2 rounded-lg text-xs cursor-pointer">+ Add</button>
      </form>
    </div>
  );
}

export function TeamPermissionsWidget({ ownerEmail }: { ownerEmail: string }) {
  const [members, setMembers] = useState([
    { email: ownerEmail, role: "Primary Signer & Admin", limit: "Unlimited" },
    { email: "controller@vaultcore.us", role: "CPA / Read-Only Auditor", limit: "$0 (View Only)" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers([...members, { email: inviteEmail, role: "Cardholder & Ops", limit: "$10,000 / mo" }]);
    setInviteEmail("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Users className="w-4 h-4 text-rose-800" />
          <span>Team Signers &amp; Dual-Control Permissions</span>
        </div>
        <span className="text-xs text-emerald-700 font-semibold">2FA Enforced</span>
      </div>

      <div className="space-y-2.5 mb-4">
        {members.map((m, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900">{m.email}</div>
              <div className="text-slate-500">{m.role}</div>
            </div>
            <span className="font-mono text-slate-700 font-semibold">{m.limit}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleInvite} className="flex gap-2">
        <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Invite teammate email..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-800" />
        <button type="submit" className="flex items-center gap-1.5 bg-slate-900 hover:bg-rose-900 text-white font-semibold px-3.5 py-2 rounded-lg text-xs cursor-pointer">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </form>
    </div>
  );
}
