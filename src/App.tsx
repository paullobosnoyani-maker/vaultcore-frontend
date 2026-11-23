import React, { useState, useEffect } from "react";
import {
  Wallet, LogOut, RefreshCw,
  LayoutDashboard, ArrowLeftRight, Landmark, FileText, TrendingUp,
  AlertCircle, CreditCard, Users, Building2, Menu, X, Eye, EyeOff
} from "lucide-react";
import { StripeDepositCard } from "./StripeDepositCard";
import { AchWithdrawalCard } from "./AchWithdrawalCard";
import { FundingPortalCard } from "./FundingPortalCard";
import { VirtualAccountCard, CashFlowChart } from "./TreasuryWidgets";
import { VirtualDebitCard, ScheduledBillsWidget, SupportChatWidget } from "./BankingWidgets";
import { FdicSweepWidget, StatementExportWidget, BeneficiariesWidget, TeamPermissionsWidget } from "./InstitutionalWidgets";
import { LandingPage } from "./LandingPage";
import { OnboardingWizard } from "./OnboardingWizard";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<any>((() => {
    try {
      const v = localStorage.getItem("user");
      return v && v !== "undefined" ? JSON.parse(v) : null;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  })());
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "payments" | "cards" | "capital" | "ledger" | "team">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberAmount, setMemberAmount] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [wireSmsCode, setWireSmsCode] = useState("");
  const [wireOtpSent, setWireOtpSent] = useState(false);
  const [sendingWireOtp, setSendingWireOtp] = useState(false);
  const [wireTransferMode, setWireTransferMode] = useState<"account" | "email">("account");
  const [showBalance, setShowBalance] = useState(true);

  const fetchDashboard = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${user.id}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setWallets(data.wallets || []);
      setTransactions(data.recentTransactions || []);
      if (data.wallets?.length > 0) {
        setSenderId((prev) => prev || data.wallets[0].id);
        if (data.wallets.length > 1) setReceiverId((prev) => prev || data.wallets[1].id);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token && user?.id) fetchDashboard();
  }, [token, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setShowAuth(false);
    setMobileMenuOpen(false);
  };

  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    if (senderId === receiverId) {
      setActionMessage("Error: Choose two different wallets.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderAccountId: senderId,
          receiverAccountId: receiverId,
          amount: parseFloat(transferAmount),
          description: "Internal Treasury Allocation",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage("Internal treasury transfer settled.");
      setTransferAmount("");
      fetchDashboard();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };
     const requestWireSms = async () => {
    setActionMessage("");
    if (!memberEmail || !memberAmount) {
      setActionMessage("Error: Enter recipient 12-digit account number (or email) and amount first.");
      return;
    }
    setSendingWireOtp(true);
    try {
      const res = await fetch(`${API_URL}/wire-sms-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderUserId: user.id,
          recipientIdentifier: memberEmail,
          amount: parseFloat(memberAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWireOtpSent(true);
      setActionMessage(data.message);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setSendingWireOtp(false);
    }
  };

  const submitMemberTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    try {
      const res = await fetch(`${API_URL}/member-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderUserId: user.id,
          recipientIdentifier: memberEmail,
          smsCode: wireSmsCode,
          amount: parseFloat(memberAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage(data.message);
      setMemberEmail("");
      setMemberAmount("");
      setWireSmsCode("");
      setWireOtpSent(false);
      fetchDashboard();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };
   
  if (!token) {
    if (!showAuth) {
      return (
        <LandingPage
          onOpenAuth={(m) => {
            setIsLogin(m);
            setShowAuth(true);
          }}
        />
      );
    }
    return (
      <OnboardingWizard
        initialLoginMode={isLogin}
        onBackHome={() => setShowAuth(false)}
        onSuccessAuth={(t, u) => {
          localStorage.setItem("token", t);
          localStorage.setItem("user", JSON.stringify(u));
          setToken(t);
          setUser(u);
        }}
      />
    );
  }

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);
  const navItems = [
    { id: "overview", label: "Home Console", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts & Routing", icon: Building2 },
    { id: "payments", label: "Payments & ACH", icon: ArrowLeftRight },
    { id: "cards", label: "Corporate Cards", icon: CreditCard },
    { id: "capital", label: "Grants & Capital", icon: Landmark },
    { id: "ledger", label: "Ledger & Statements", icon: FileText },
    { id: "team", label: "Team & Security", icon: Users },
  ];

  const handleTabSelect = (id: any) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar: Slide-out drawer on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 shrink-0 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="VaultCore US"
                className="w-8 h-8 rounded-lg object-contain bg-[#090D16] p-0.5 border border-white/10"
              />
              <span className="font-bold text-lg text-slate-950">
                VaultCore <span className="text-xs text-rose-800">US</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-rose-50 text-rose-900 border border-rose-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-rose-800" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="px-2">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.business_name || user?.email}
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                user?.kyc_status === "VERIFIED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              CIP: {user?.kyc_status || "PENDING"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-800 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="min-h-16 border-b border-slate-200 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-950 md:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-950">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setActiveTab("payments")}
              className="bg-rose-800 hover:bg-rose-900 text-white px-3 md:px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Move Money
            </button>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {user?.kyc_status !== "VERIFIED" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>CIP / KYB Verification In Progress:</strong> External wire limits lift automatically upon compliance approval.
              </div>
            </div>
          )}

          {actionMessage && (
        <div className="bg-[#111827] border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md">
        <span>{actionMessage}</span>
        <button
      type="button"
      onClick={() => setActionMessage("")}
      className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
    >
      ×
    </button>
  </div>
)}

         {activeTab === "overview" && (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold uppercase mb-1">
                    <TrendingUp className="w-4 h-4 text-rose-800" />
                    <span>Total VaultCore US Balance (USD)</span>
                    <button
                      type="button"
                      onClick={() => setShowBalance(!showBalance)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold normal-case transition cursor-pointer"
                      title={showBalance ? "Hide Balances" : "Show Balances"}
                    >
                      {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showBalance ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-950 font-mono">
                    {showBalance
                      ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "••••••••••"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Custodial accounts held at FDIC-insured partner banks &bull; ABA 021000021
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab("payments")}
                    className="bg-rose-800 hover:bg-rose-900 text-white font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    + Add / Send Funds
                  </button>
                  <button
                    onClick={() => setActiveTab("cards")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Manage Visa Card
                  </button>
                  <button
                    onClick={() => setActiveTab("capital")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Apply for Capital
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wallets.map((w) => {
                  const pct = totalBalance > 0 ? Math.round((parseFloat(w.balance) / totalBalance) * 100) : 0;
                  return (
                    <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
                      <div className="flex justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase">{w.account_name}</span>
                        <Wallet className="w-4 h-4 text-rose-800" />
                      </div>
                      <div className="text-2xl font-bold text-slate-950 font-mono">
                        {showBalance
                          ? `$${parseFloat(w.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "••••••••"}
                      </div>
                      <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-800 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VirtualDebitCard holderName={user?.business_name || user?.email || "AUTHORIZED SIGNER"} />
                <FdicSweepWidget totalBalance={totalBalance} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VirtualAccountCard userEmail={user?.email} />
                <CashFlowChart transactions={transactions} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <h2 className="text-sm font-bold text-slate-950">Recent Treasury Activity</h2>
               <button
                 type="button"
                 onClick={() => setActiveTab("ledger")}
                 className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
               >
                 View Full Ledger & PDF Statements →
               </button>
             </div>
             {transactions.length === 0 ? (
               <div className="p-6 text-xs text-slate-500">
                 No settled transactions recorded yet. Deposits, ACH withdrawals, and internal transfers will appear here automatically.
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs min-w-[500px]">
                   <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                     <tr>
                       <th className="px-6 py-3">Account</th>
                       <th className="px-6 py-3">Type</th>
                       <th className="px-6 py-3">Description</th>
                       <th className="px-6 py-3 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {transactions.slice(0, 6).map((tx) => (
                       <tr key={tx.id}>
                         <td className="px-6 py-3.5 font-semibold">{tx.account_name}</td>
                         <td className="px-6 py-3.5 font-mono text-slate-500">{tx.transaction_type}</td>
                         <td className="px-6 py-3.5">{tx.description}</td>
                         <td className="px-6 py-3.5 text-right font-mono font-bold">
                           ${parseFloat(tx.amount).toFixed(2)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>

            </>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VirtualAccountCard userEmail={user?.email} />
                <FdicSweepWidget totalBalance={totalBalance} />
              </div>
              <form onSubmit={submitTransfer} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-xl">
                <h2 className="text-sm font-bold text-slate-950">Instant Sub-Account Rebalance</h2>
                <select
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      From: {w.account_name} (${parseFloat(w.balance || "0").toFixed(2)})
                    </option>
                  ))}
                </select>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      To: {w.account_name} (${parseFloat(w.balance || "0").toFixed(2)})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount (USD)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full bg-rose-800 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Execute Treasury Allocation
                </button>
              </form>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StripeDepositCard wallets={wallets} token={token} onSuccess={fetchDashboard} onMessage={setActionMessage} />
                <AchWithdrawalCard token={token} onSuccess={fetchDashboard} onMessage={setActionMessage} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BeneficiariesWidget />
              <form onSubmit={submitMemberTransfer} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-sm font-bold text-slate-950">Instant VaultCore Member Wire</h2>
                 <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                   SMS 2FA Protected
                 </span>
               </div>

               {/* Dedicated Mode Toggle: 12-Digit Account Number vs Member Email */}
               <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                 <button
                   type="button"
                   onClick={() => {
                     setWireTransferMode("account");
                     setMemberEmail("");
                     setWireOtpSent(false);
                     setWireSmsCode("");
                   }}
                   className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                     wireTransferMode === "account"
                       ? "bg-slate-950 text-white shadow-xs"
                       : "text-slate-600 hover:text-slate-900"
                   }`}
                 >
                   Account Number
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     setWireTransferMode("email");
                     setMemberEmail("");
                     setWireOtpSent(false);
                     setWireSmsCode("");
                   }}
                   className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                     wireTransferMode === "email"
                       ? "bg-slate-950 text-white shadow-xs"
                       : "text-slate-600 hover:text-slate-900"
                   }`}
                 >
                   Member Email
                 </button>
               </div>

               {wireTransferMode === "account" ? (
                 <div>
                   <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                     Recipient 12-Digit VaultCore Account Number
                   </label>
                   <input
                     type="text"
                     inputMode="numeric"
                     maxLength={12}
                     required
                     value={memberEmail}
                     onChange={(e) => setMemberEmail(e.target.value.replace(/\D/g, ""))}
                     placeholder="e.g. 884920194821"
                     className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono tracking-wider"
                   />
                 </div>
               ) : (
                 <div>
                   <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                     Recipient Registered Email Address
                   </label>
                   <input
                     type="email"
                     required
                     value={memberEmail}
                     onChange={(e) => setMemberEmail(e.target.value)}
                     placeholder="e.g. treasury@company.com"
                     className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                   />
                 </div>
               )}

               <div>
                 <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                   Wire Amount (USD)
                 </label>
                 <input
                   type="number"
                   step="0.01"
                   min="1"
                   required
                   value={memberAmount}
                   onChange={(e) => setMemberAmount(e.target.value)}
                   placeholder="0.00"
                   className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                 />
               </div>

               {!wireOtpSent ? (
                 <button
                   type="button"
                   disabled={sendingWireOtp}
                   onClick={requestWireSms}
                   className="w-full bg-rose-800 hover:bg-rose-900 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                 >
                   {sendingWireOtp ? "Sending SMS Code..." : "Send 6-Digit SMS Verification Code"}
                 </button>
               ) : (
                 <div className="space-y-3">
                <input
                      type="text"
                      maxLength={6}
                      required
                      value={wireSmsCode}
                      onChange={(e) => setWireSmsCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-Digit SMS OTP Code"
                      className="w-full bg-slate-50 border border-emerald-400 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={requestWireSms}
                        className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Resend SMS
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                      >
                        Verify SMS &amp; Settle Wire
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === "cards" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VirtualDebitCard holderName={user?.business_name || user?.email || "AUTHORIZED SIGNER"} />
            <ScheduledBillsWidget />
          </div>
        )}

        {activeTab === "capital" && (
          <FundingPortalCard
            userId={user.id}
            userRole={user?.role}
            token={token}
            onSuccess={fetchDashboard}
            onMessage={setActionMessage}
          />
        )}

        {activeTab === "ledger" && (
          <div className="space-y-6">
            <StatementExportWidget user={user} wallets={wallets} transactions={transactions} />
            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Account</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 font-semibold">{tx.account_name}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{tx.transaction_type}</td>
                      <td className="px-6 py-4">{tx.description}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        ${parseFloat(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

                      {activeTab === "team" && <TeamPermissionsWidget ownerEmail={user?.email || "admin@vaultcore.us"} />}
      </div>
    </main>
    <SupportChatWidget
      userEmail={user?.email || "Client"}
      wallets={wallets}
      recentTransactions={transactions}
      virtualAccountNumber={virtualAccountNumber}
    />
  </div>
);
}
