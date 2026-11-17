import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, CreditCard, TrendingUp, Landmark, Lock, Building2 } from "lucide-react";

interface SubPageProps {
  page: string;
  onBack: () => void;
  onOpenAuth: (isLogin: boolean) => void;
}

export function SubPages({ page, onBack, onOpenAuth }: SubPageProps) {
  const [yieldInput, setYieldInput] = useState(350000);
  const annual = (yieldInput * 0.0485).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-rose-800 hover:text-rose-950 mb-8 cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to VaultCore US Homepage</span>
      </button>

      {page === "banking" && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Commercial Checking &amp; Clearing</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">Segregated Sub-Wallets &amp; Same-Day US Clearing</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Every approved VaultCore US entity receives dedicated checking, payroll, and reserve sub-accounts—each backed by US ABA routing numbers and governed by an atomic double-entry ledger.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Operating Checking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Primary daily clearing account for Stripe payouts, vendor ACH debits, and incoming domestic Fedwires.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Payroll &amp; Tax Reserves</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Ring-fence bi-weekly payroll and quarterly IRS EFTPS tax obligations so operating spend never touches tax reserves.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">$0 Standard Domestic ACH</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Standard online domestic ACH transfers carry $0.00 platform fees. Expedited wires and international SWIFT wires follow our published fee schedule.</p>
            </div>
          </div>
        </div>
      )}

      {page === "treasury" && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Treasury Management</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">Earn 4.85% APY* on Idle Operating Reserves</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Capture institutional yield on settled reserve balances above $50,000 while keeping funds liquid for same-day internal transfers.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase text-slate-500">Illustrative Reserve Balance</span>
              <span className="text-2xl font-bold font-mono text-rose-800">${yieldInput.toLocaleString("en-US")}</span>
            </div>
            <input type="range" min={50000} max={2500000} step={25000} value={yieldInput} onChange={(e) => setYieldInput(Number(e.target.value))} className="w-full accent-rose-800 mb-6 cursor-pointer" />
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Estimated Annualized Yield at 4.85% Variable APY*</div>
              <div className="text-3xl font-bold font-mono text-slate-950 mt-1">+${annual} / yr</div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              *4.85% APY is a variable rate accurate as of November 15, 2026, applicable to settled Treasury balances over $50,000. Subject to change without notice.
            </p>
          </div>
        </div>
      )}

      {page === "cards" && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Commercial Card Issuing</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">Titanium &amp; Virtual Visa&reg; Corporate Cards</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Issue dedicated vendor and department cards in seconds with hard monthly spend caps, instant freeze controls, and automatic accounting GL tagging.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl bg-gradient-to-br from-[#1C202B] via-[#101218] to-[#310A16] border border-slate-700 p-8 text-white shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-300">VaultCore Commercial</span>
                <span className="text-lg font-black italic">VISA</span>
              </div>
              <div className="w-11 h-8 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 mb-6" />
              <div className="font-mono text-xl tracking-[0.2em] text-slate-100 mb-6">4532  8910  4421  9084</div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>TITANIUM CORPORATE CARD</span>
                <span className="text-rose-300">EMV + NFC ENABLED</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5"><div className="font-bold text-sm text-slate-950">Merchant &amp; Category Spend Limits</div><div className="text-xs text-slate-600 mt-1">Lock individual cards to specific SaaS vendors or monthly dollar budgets.</div></div>
              <div className="bg-white border border-slate-200 rounded-xl p-5"><div className="font-bold text-sm text-slate-950">One-Click Card Freeze &amp; Rotation</div><div className="text-xs text-slate-600 mt-1">Freeze or replace virtual card numbers instantly without disrupting other subscriptions.</div></div>
              <div className="bg-white border border-slate-200 rounded-xl p-5"><div className="font-bold text-sm text-slate-950">Automated GL Code Mapping</div><div className="text-xs text-slate-600 mt-1">Every card transaction reconciles cleanly to your CSV audit statement.</div></div>
            </div>
          </div>
        </div>
      )}

      {page === "capital" && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Growth Financing &amp; Grants</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">US Small-Business Grants &amp; Working Capital</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Approved US entities can apply directly inside their VaultCore console for $10,000 to $250,000 in non-dilutive expansion grants or working capital lines.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Underwriting Requirements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Requires active US LLC/C-Corp/S-Corp registration, verified IRS EIN, beneficial owner CIP verification, and operating ledger history.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Segregated Reserve Disbursement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Approved capital disburses directly into your Grant &amp; Loan Reserve wallet with full audit logging.</p>
            </div>
          </div>
        </div>
      )}

      {(page === "infrastructure" || page === "security" || page === "company") && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Custody, Security &amp; Governance</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">Partner-Bank Architecture &amp; Regulatory Transparency</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              VaultCore Financial Technologies Inc. is a financial technology company, not a bank. Customer deposits are held in segregated custodial accounts at our FDIC-insured US partner banks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Multi-Bank FDIC Sweep</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Eligible balances above $250,000 may be swept across up to 10 FDIC-insured program banks for up to $2.5M in pass-through FDIC coverage, subject to FDIC rules.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Cryptographic &amp; Ledger Controls</h3>
              <p className="text-xs text-slate-600 leading-relaxed">AES-256 encryption at rest, TLS 1.3 in transit, role-isolated CPA/Admin permissions, and an append-only ACID double-entry ledger.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">New York Headquarters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">228 Park Ave S, Suite 84910, New York, NY 10003. Contact our advisory desk at advisory@vaultcore.us.</p>
            </div>
          </div>
        </div>
      )}

      
      {page === "solutions" && (
        <div className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Enterprise &amp; Industry Solutions</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">Tailored Treasury for Every Stage of US Growth</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Whether you are a venture-backed startup extending runway or a multi-entity logistics operator managing vendor ACH batches, VaultCore US adapts to your financial workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Startups &amp; SaaS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Earn 4.85% variable APY* on raised capital while issuing virtual Visa cards for AWS, Google Cloud, and SaaS vendors.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">Logistics &amp; Supply Chain</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Automate same-day domestic ACH vendor settlements and access $10K–$250K inventory expansion grants.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-950 mb-2">CPAs &amp; Finance Teams</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Grant read-only auditor roles, tag ledger entries with GL codes, and export monthly CSV statements &amp; IRS 1099-INT forms.</p>
            </div>
          </div>
        </div>
      )}

      {page === "comparison" && (
        <div className="space-y-8">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-800 mb-2">Platform Comparison</div>
            <h1 className="text-4xl font-bold text-slate-950 mb-4">VaultCore US vs. Legacy Commercial Banks</h1>
          </div>
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
      )}

      {page === "terms" && (
        <div className="space-y-6 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800">Legal Agreement</div>
          <h1 className="text-3xl font-bold text-slate-950">Platform Terms of Service</h1>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p><strong>1. Non-Bank Financial Technology Status:</strong> VaultCore Financial Technologies Inc. ("VaultCore") is a financial technology company, not a chartered bank or depository institution. Banking services, custodial accounts, and payment rails are provided through licensed third-party banking and payment partners.</p>
            <p><strong>2. Eligibility & CIP/KYC Verification:</strong> Accounts are available strictly to verified US individuals and registered US business entities. You authorize VaultCore and its partners to verify your identity, SSN/EIN, and beneficial ownership under the USA PATRIOT Act (31 CFR 1020.220).</p>
            <p><strong>3. Electronic Ledger & Transfers:</strong> Internal wallet balances reflect atomic ledger entries backed by custodial USD funds. ACH transfers, card deposits, and payouts are subject to settlement timelines, fraud screening, and OFAC sanctions compliance.</p>
            <p><strong>4. Governing Law & Arbitration:</strong> Disputes arising under these Terms are governed by the laws of the State of Delaware and resolved via binding arbitration.</p>
          </div>
        </div>
      )}

      {page === "privacy" && (
        <div className="space-y-6 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800">Data Governance & GLBA</div>
          <h1 className="text-3xl font-bold text-slate-950">Privacy Policy & Gramm-Leach-Bliley Notice</h1>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p><strong>1. Information We Collect:</strong> We collect Customer Identification Program (CIP) records (legal name, date of birth, US street address, SSN/EIN), authentication logs, and transaction ledger records required by federal anti-money laundering (AML) regulations.</p>
            <p><strong>2. How We Use & Share Data:</strong> We never sell your personal or financial information. Data is shared strictly with regulated banking partners, payment processors (such as Stripe), identity verification vendors, and regulatory authorities as required by law.</p>
            <p><strong>3. Encryption & Retention:</strong> All sensitive data is encrypted in transit via TLS 1.3 and at rest using AES-256. Federal Bank Secrecy Act (BSA) rules require retention of CIP and ledger records for at least 5 years after account closure.</p>
          </div>
        </div>
      )}

      {page === "esign" && (
        <div className="space-y-6 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800">15 U.S.C. 7001 Disclosure</div>
          <h1 className="text-3xl font-bold text-slate-950">Electronic Communications (E-Sign) Consent</h1>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p><strong>1. Scope of Consent:</strong> By opening an account or signing in electronically, you consent to receive all account agreements, monthly statements, 1099-INT tax forms, security OTP codes, and regulatory disclosures electronically.</p>
            <p><strong>2. Hardware & Software Requirements:</strong> Accessing electronic records requires a modern web browser supporting TLS 1.2+, a valid email address, and PDF viewing capability.</p>
            <p><strong>3. Withdrawing Consent:</strong> You may withdraw E-Sign consent at any time by contacting support, which may result in closure of your online treasury account.</p>
          </div>
        </div>
      )}

      {page === "fees" && (
        <div className="space-y-6 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800">Truth in Savings & Fee Transparency</div>
          <h1 className="text-3xl font-bold text-slate-950">Schedule of Fees & Limits</h1>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr><th className="px-6 py-3">Service / Transaction</th><th className="px-6 py-3">Fee</th><th className="px-6 py-3">Notes / Limits</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr><td className="px-6 py-3 font-medium">Monthly Account Maintenance</td><td className="px-6 py-3 font-bold text-rose-800">$0.00</td><td className="px-6 py-3">Includes Everyday, Savings, & Reserve wallets</td></tr>
                <tr><td className="px-6 py-3 font-medium">Standard Domestic ACH Transfer</td><td className="px-6 py-3 font-bold text-rose-800">$0.00</td><td className="px-6 py-3">1–3 business days settlement</td></tr>
                <tr><td className="px-6 py-3 font-medium">Internal Member-to-Member P2P</td><td className="px-6 py-3 font-bold text-rose-800">$0.00</td><td className="px-6 py-3">Instant atomic ledger settlement</td></tr>
                <tr><td className="px-6 py-3 font-medium">Card / Instant Funding</td><td className="px-6 py-3 font-bold text-rose-800">2.9% + $0.30</td><td className="px-6 py-3">Pass-through card network processing fee</td></tr>
                <tr><td className="px-6 py-3 font-medium">Returned ACH / Insufficient Funds</td><td className="px-6 py-3 font-bold text-rose-800">$15.00</td><td className="px-6 py-3">Assessed only on failed external pull attempts</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {page === "faq" && (
        <div className="space-y-6 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-800">Regulatory &amp; Operational FAQ</div>
          <h1 className="text-4xl font-bold text-slate-950">Frequently Asked Questions</h1>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6"><h3 className="font-bold text-slate-950 mb-2">Is VaultCore a chartered bank, and how is my money protected?</h3><p className="text-sm text-slate-600 leading-relaxed">VaultCore is a financial technology company, not an FDIC-insured bank. Banking services and custodial deposit accounts are provided by our FDIC-insured US partner banks, with up to $2.5M in pass-through FDIC sweep eligibility.</p></div>
            <div className="bg-white border border-slate-200 rounded-xl p-6"><h3 className="font-bold text-slate-950 mb-2">How is the 4.85% APY calculated?</h3><p className="text-sm text-slate-600 leading-relaxed">4.85% APY is a variable rate accurate as of November 15, 2026, earned on settled Treasury Reserve balances of $50,000 or more. Interest accrues daily and credits monthly.</p></div>
            <div className="bg-white border border-slate-200 rounded-xl p-6"><h3 className="font-bold text-slate-950 mb-2">Are there fees on domestic ACH transfers?</h3><p className="text-sm text-slate-600 leading-relaxed">Standard online domestic ACH transfers carry $0.00 platform fees. Expedited same-day Fedwires, international SWIFT wires, and returned items follow our published fee schedule.</p></div>
          </div>
        </div>
      )}

      <div className="mt-12 bg-slate-950 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-lg font-bold">Ready to open your VaultCore US commercial account?</div>
          <div className="text-xs text-slate-400 mt-1">Submit your CIP/KYB application online in ~5 minutes. Subject to bank partner approval.</div>
        </div>
        <button onClick={() => onOpenAuth(false)} className="flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm shrink-0 cursor-pointer">
          <span>Start Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
