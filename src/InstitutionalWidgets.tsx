import React, { useState } from "react";
import { ShieldCheck, Download, TrendingUp, UserPlus, BookUser, FileSpreadsheet, CheckCircle2, FileText } from "lucide-react";

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

export function StatementExportWidget({
  user,
  wallets = [],
  transactions = [],
}: {
  user: any;
  wallets?: any[];
  transactions: any[];
}) {
  const [downloaded, setDownloaded] = useState(false);

  const exportCsv = () => {
    const rows = [
      ["Date", "Account", "Transaction Type", "Description", "Amount (USD)"].join(","),
      ...transactions.map((t) =>
        [
          new Date(t.created_at || Date.now()).toLocaleDateString(),
          t.account_name,
          t.transaction_type,
          `"${String(t.description || "").replace(/"/g, '""')}"`,
          t.amount,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VaultCore_US_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const exportOfficialPdf = () => {
    const statementDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const statementMonth = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);
    const logoUrl = `${window.location.origin}/logo.png`;
    const entityName = user?.business_name || user?.full_name || user?.email || "Commercial Client";

    const walletRowsHtml =
      wallets.length > 0
        ? wallets
            .map(
              (w) => `
              <tr>
                <td><strong>${w.account_name}</strong></td>
                <td class="mono">${w.account_type || "COMMERCIAL"}</td>
                <td class="mono">USD</td>
                <td class="mono right"><strong>$${parseFloat(w.balance || "0").toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</strong></td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="4" class="muted">No active custodial sub-accounts.</td></tr>`;

    const txRowsHtml =
      transactions.length > 0
        ? transactions
            .map(
              (t) => `
              <tr>
                <td class="mono">${new Date(t.created_at || Date.now()).toLocaleDateString("en-US")}</td>
                <td>${t.account_name || "Treasury"}</td>
                <td class="mono">${t.transaction_type || "SETTLEMENT"}</td>
                <td>${t.description || "Commercial Treasury Entry"}</td>
                <td class="mono right">$${parseFloat(t.amount || "0").toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="5" class="muted" style="text-align:center; padding:18px;">No settled ledger entries recorded during this statement period.</td></tr>`;

    const printWindow = window.open("", "_blank", "width=920,height=1080");
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>VaultCore US — Official Commercial Treasury Statement (${statementMonth})</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 36px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #090D16; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 44px; height: 44px; border-radius: 8px; background: #090D16; padding: 4px; object-fit: contain; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #090D16; }
    .brand-title span { color: #be123c; }
    .brand-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; margin-top: 2px; }
    .doc-meta { text-align: right; font-size: 11px; color: #475569; line-height: 1.6; }
    .doc-badge { display: inline-block; background: #090D16; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; background: #f8fafc; }
    .box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
    .box-val { font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.5; }
    .balance-banner { background: #090D16; color: #fff; border-radius: 10px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .balance-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
    .balance-amt { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 26px; font-weight: 800; color: #fff; margin-top: 2px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; margin: 22px 0 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; text-align: left; padding: 9px 12px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
    td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .right { text-align: right; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .muted { color: #64748b; font-style: italic; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #64748b; line-height: 1.55; }
    @media print { body { padding: 18px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="VaultCore US" />
      <div>
        <div class="brand-title">VaultCore <span>US</span></div>
        <div class="brand-sub">Commercial Treasury &amp; Liquidity Infrastructure</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-badge">Official Account Statement</div><br/>
      <strong>Statement Period:</strong> ${statementMonth}<br/>
      <strong>Issue Date:</strong> ${statementDate}<br/>
      <strong>Reference ID:</strong> VC-${String(user?.id || "0001").slice(0, 8).toUpperCase()}
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="box-label">Account Holder &amp; CIP Status</div>
      <div class="box-val">${entityName}</div>
      <div style="font-size:11px; color:#475569; margin-top:2px;">
        Email: ${user?.email || "N/A"}<br/>
        Compliance Status: <strong>${user?.kyc_status || "VERIFIED"}</strong>
      </div>
    </div>
    <div class="box">
      <div class="box-label">US Clearing &amp; Routing Credentials</div>
      <div class="box-val">ABA Routing Number: <span class="mono">021000021</span></div>
      <div style="font-size:11px; color:#475569; margin-top:2px;">
        Fedwire / ACH Settlement: Enabled (Same-Day USD)<br/>
        Sweep Program: FDIC Pass-Through up to $2,500,000
      </div>
