import React, { useState, useEffect, Suspense } from "react";
import {
  Wallet, LogOut, RefreshCw,
  LayoutDashboard, ArrowLeftRight, Landmark, FileText, TrendingUp,
  AlertCircle, CreditCard, Users, Building2, Menu, X, Eye, EyeOff
} from "lucide-react";
import { SkeletonCard, SkeletonWidget, SkeletonTable } from "./components/Skeleton";
import { LandingPage } from "./LandingPage";
import { OnboardingWizard } from "./OnboardingWizard";
import { StripeDepositCard } from "./StripeDepositCard";
import { AchWithdrawalCard } from "./AchWithdrawalCard";
import { FundingPortalCard } from "./FundingPortalCard";
import { VirtualAccountCard, CashFlowChart } from "./TreasuryWidgets";
import { VirtualDebitCard, ScheduledBillsWidget, SupportChatWidget } from "./BankingWidgets";
import { FdicSweepWidget, StatementExportWidget, BeneficiariesWidget, TeamPermissionsWidget } from "./InstitutionalWidgets";

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
  const [backendWarming, setBackendWarming] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRecipientName, setMemberRecipientName] = useState("");
  const [memberRoutingNumber, setMemberRoutingNumber] = useState("021000021");
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>({});
  const [wireErrors, setWireErrors] = useState<Record<string, string>>({});
  const [memberAmount, setMemberAmount] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [wireSmsCode, setWireSmsCode] = useState("");
  const [wireOtpSent, setWireOtpSent] = useState(false);
  const [sendingWireOtp, setSendingWireOtp] = useState(false);
  const [wireTransferMode, setWireTransferMode] = useState<"account" | "email">("account")
;
  const [showBalance, setShowBalance] = useState(true);

  const fetchDashboard = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    setBackendWarming(true);
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
    } catch (err) {
      setActionMessage("Waking up backend... please wait.");
    } finally {
      setLoading(false);
      setBackendWarming(false);
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
    const errors: Record<string, string> = {};
    if (!senderId) errors.senderId = "Select source wallet";
    if (!receiverId) errors.receiverId = "Select destination wallet";
    if (senderId === receiverId) errors.receiverId = "Must be different wallets";
    if (!transferAmount || parseFloat(transferAmount) < 1) errors.transferAmount = "Enter amount ≥ $1";
    setTransferErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // OPTIMISTIC UPDATE
    const amount = parseFloat(transferAmount);
    setWallets(prev => prev.map(w => {
      if (w.id === senderId) return { ...w, balance: (parseFloat(w.balance) - amount).toFixed(2) };
      if (w.id === receiverId) return { ...w, balance: (parseFloat(w.balance) + amount).toFixed(2) };
      return w;
    }));
    setTransferAmount("");

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
      fetchDashboard(); // reconcile
    } catch (err: any) {
      // ROLLBACK on error
      fetchDashboard();
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

  const validateWire = () => {
    const errors: Record<string, string> = {};
    if (!memberRecipientName) errors.memberRecipientName = "Enter beneficiary name";
    if (!memberRoutingNumber || memberRoutingNumber.length !== 9) errors.memberRoutingNumber = "Enter 9-digit routing number";
    if (!memberEmail) errors.memberEmail = wireTransferMode === "account" ? "Enter 12-digit account number" : "Enter email";
    if (!memberAmount || parseFloat(memberAmount) < 1) errors.memberAmount = "Enter amount ≥ $1";
    if (wireOtpSent && (!wireSmsCode || wireSmsCode.length !== 6)) errors.wireSmsCode = "Enter 6-digit OTP";
    setWireErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitMemberTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    if (!validateWire()) return;
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
          recipientName: memberRecipientName.trim(),
          routingNumber: memberRoutingNumber.trim(),
          smsCode: wireSmsCode,
          amount: parseFloat(memberAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage(data.message);
      setMemberEmail("");
      setMemberRecipientName("");
      setMemberRoutingNumber("021000021");
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
    <div className="min-h-screen bg-obsidian text-slate-50 flex font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar: Slide-out drawer on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar flex flex-col justify-between p-5 shrink-0
          transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="flex items-center justify-between px-2 mb-8 text-slate-50"
>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="VaultCore US"
                className="w-8 h-8 rounded-lg object-contain bg-[#090D16] p-0.5 border border-white/10"
              />
              <span className="font-bold text-lg text-slate-50">
                VaultCore <span className="text-xs text-rose-400">US</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden cursor-pointer"
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-smooth cursor-pointer ${
                    active
                      ? "bg-rose-900/30 text-rose-300 border border-rose-800/50"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-rose-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="px-2">
            <div className="text-xs font-bold text-slate-100 truncate">
              {user?.business_name || user?.email}
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                user?.kyc_status === "VERIFIED"
                  ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50"
                  : "bg-amber-900/30 text-amber-400 border-amber-800/50"
              }`}
            >
              CIP: {user?.kyc_status || "PENDING"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="min-h-16 border-b border-white/10 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-2 glass-sidebar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white md:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-100">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setActiveTab("payments")}
              className
="bg-rose-700 hover:bg-rose-800 text-white px-3 md:px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Move Money
            </button>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {user?.kyc_status !== "VERIFIED" && (
            <div className="bg-amber-900/30 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>CIP / KYB Verification In Progress:</strong> External wire limits lift automatically upon compliance approval.
              </div>
            </div>
          )}

          {(actionMessage || backendWarming) && (
            <div className="bg-[#111827] border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md">
             <span>{actionMessage || "Establishing encrypted connection to VaultCore clearing ledger..."}</span>
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
                 loading ? (
              <>
                <SkeletonWidget />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkeletonWidget />
                  <SkeletonWidget />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkeletonWidget />
                  <SkeletonWidget />
                </div>
                <SkeletonTable rows={6} />
              </>
            ) : (
              <>
                <div className="glass-card p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2.5 text-slate-400 text-xs font-semibold uppercase mb-1">
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                      <span>Total VaultCore US Balance (USD)</span>
                      <button
                        type="button"
                        onClick={() => setShowBalance(!showBalance)}
                        className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-0.5 rounded-md text-[11px] font-semibold normal-case transition cursor-pointer"
                        title={showBalance ? "Hide Balances" : "Show Balances"}
                      >
                        {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showBalance ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <div className="text-
3xl md:text-4xl font-bold text-slate-50 font-mono">
                      {showBalance
                        ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "••••••••••"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Custodial accounts held at FDIC-insured partner banks • ABA 021000021
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="bg-rose-700 hover:bg-rose-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      + Add / Send Funds
                    </button>
                    <button
                      onClick={() => setActiveTab("cards")}
                      className="bg-white/5 hover:bg-white/10 text-slate-100 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      Manage Visa Card
                    </button>
                    <button
                      onClick={() => setActiveTab("capital")}
                      className="bg-white/5 hover:bg-white/10 text-slate-100 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      Apply for Capital
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {wallets.map((w) => {
                    const pct = totalBalance > 0 ? Math.round((parseFloat(w.balance) / totalBalance) * 100) : 0;
                    return (
                      <div key={w.id} className="glass-card p-6">
                        <div className="flex justify-between text-slate-400 mb-2">
                          <span className="text-xs font-bold uppercase">{w.account_name}</span>
                          <Wallet className="w-4 h-4 text-rose-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-50 font-mono">
                          {showBalance
                            ? `$${parseFloat(w.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "••••••••"}
                        </div>
                        <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Suspense fallback={<SkeletonWidget />}>
                    <VirtualDebitCard holderName={user?.business_name || user?.email || "AUTHORIZED SIGNER"} />
                  </Suspense>
                  <Suspense fallback={<SkeletonWidget />}>
                    <FdicSweepWidget totalBalance={totalBalance} />
                  </Suspense>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Suspense fallback={<SkeletonWidget />}>
                    <VirtualAccountCard userEmail={user?.email} />
                  </Suspense>
                  <Suspense fallback={<SkeletonWidget />}>
                    <CashFlowChart transactions={transactions} />
                  </Suspense
>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-100">Recent Treasury Activity</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("ledger")}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-slate-400 uppercase border-b border-white/10">
                          <tr>
                            <th className="px-6 py-3">Account</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {transactions.slice(0, 6).map((tx) => (
                            <tr key={tx.id}>
                              <td className="px-6 py-3.5 font-semibold">{tx.account_name}</td>
                              <td className="px-6 py-3.5 font-mono text-slate-400">{tx.transaction_type}</td>
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
              )
            )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<SkeletonWidget />}>
                  <VirtualAccountCard userEmail={user?.email} userId={user?.id} />
                </Suspense>
                <Suspense fallback={<SkeletonWidget />}>
                  <FdicSweepWidget totalBalance={totalBalance} />
                </Suspense>
              </div>
              <form onSubmit={submitTransfer} className="glass-card p-6 space-y-4 max-w-xl">
                <h2 className="text-sm font-bold text-slate-100">Instant Sub-Account Rebalance</h2>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">From Wallet</label>
                  <select
                    value={senderId}
                    onChange={(e) => { setSenderId(e.target.value); setTransferErrors(prev => ({...prev, senderId: ""})); }}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs ${transferErrors.senderId ? "border-rose-500" : ""}`
}
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        From: {w.account_name} (${parseFloat(w.balance || "0").toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {transferErrors.senderId && <p className="text-[11px] text-rose-500 mt-1">{transferErrors.senderId}</p>}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">To Wallet</label>
                  <select
                    value={receiverId}
                    onChange={(e) => { setReceiverId(e.target.value); setTransferErrors(prev => ({...prev, receiverId: ""})); }}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs ${transferErrors.receiverId ? "border-rose-500" : ""}`}
                  >
                            {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        To: {w.account_name} (${parseFloat(w.balance || "0").toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {transferErrors.receiverId && <p className="text-[11px] text-rose-500 mt-1">{transferErrors.receiverId}</p>}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={transferAmount}
                    onChange={(e) => { setTransferAmount(e.target.value); setTransferErrors(prev => ({...prev, transferAmount: ""})); }}
                    placeholder="Amount (USD)"
                    className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs ${transferErrors.transferAmount ? "border-rose-500" : ""}`}
                  />
                  {transferErrors.transferAmount && <p className="text-[11px] text-rose-500 mt-1">{transferErrors.transferAmount}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Execute Treasury Allocation
                </button>
              </form>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<SkeletonWidget />}>
                  <StripeDepositCard wallets={wallets} token={token} onSuccess={fetchDashboard} onMessage={setActionMessage} />
                </Suspense>
                <Suspense fallback={<SkeletonWidget />}>
                  <AchWithdrawalCard token={token} onSuccess={fetchDashboard} onMessage={setActionMessage} />
                </Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<SkeletonWidget />}>
                  <BeneficiariesWidget />
                </Suspense>
                <form onSubmit={submitMemberTransfer} className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-100">Instant VaultCore Member Wire</h2>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                      SMS 2FA Protected
                    </span>
                  </div>

                  {/* Dedicated Mode Toggle: 12-Digit Account Number vs Member Email */}
                  <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setWireTransferMode("account");
                        setMemberEmail("");
                        setWireOtpSent(false);
                        setWireSmsCode("");
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-smooth cursor-pointer ${
                        wireTransferMode === "account"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
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
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-smooth cursor-pointer ${
                        wireTransferMode === "email"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Member Email
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Beneficiary Legal / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={memberRecipientName}
                        onChange={(e) => { setMemberRecipientName(e.target.value); setWireErrors(prev => ({...prev, memberRecipientName: ""})); }}
                        placeholder="e.g. Acme Global Holdings LLC"
                        className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs ${wireErrors.memberRecipientName ? "border-rose-500" : ""}`}
                      />
                      {wireErrors.memberRecipientName && <p className="text-[11px] text-rose-500 mt-1">{wireErrors.memberRecipientName}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        ABA Routing Number (9 Digits) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        required
                        value={memberRoutingNumber}
                        onChange={(e) => { setMemberRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9)); setWireErrors(prev => ({...prev, memberRoutingNumber: ""})); }}
                        placeholder="021000021"
                        className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs font-mono tracking-wider ${wireErrors.memberRoutingNumber ? "border-rose-500" : ""}`}
                      />
                      {wireErrors.memberRoutingNumber && <p className="text-[11px] text-rose-500 mt-1">{wireErrors.memberRoutingNumber}</p>}
                    </div>
                  </div>

                  {wireTransferMode === "account" ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Recipient 12-Digit VaultCore Account Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        required
                        value={memberEmail}
                        onChange={(e) => { setMemberEmail(e.target.value.replace(/\D/g, "")); setWireErrors(prev => ({...prev, memberEmail: ""})); }}
                        placeholder="e.g. 884920194821"
                        className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs font-mono tracking-wider ${wireErrors.memberEmail ? "border-rose-500" : ""}`}
                      />

                                            {wireErrors.memberEmail && <p className="text-[11px] text-rose-500 mt-1">{wireErrors.memberEmail}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Recipient Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={memberEmail}
                        onChange={(e) => { setMemberEmail(e.target.value); setWireErrors(prev => ({...prev, memberEmail: ""})); }}
                        placeholder="e.g. treasury@company.com"
                        className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs ${wireErrors.memberEmail ? "border-rose-500" : ""}`}
                      />
                      {wireErrors.memberEmail && <p className="text-[11px] text-rose-500 mt-1">{wireErrors.memberEmail}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Wire Amount (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={memberAmount}
                      onChange={(e) => { setMemberAmount(e.target.value); setWireErrors(prev => ({...prev, memberAmount: ""})); }}
                      placeholder="0.00"
                      className={`w-full bg-obsidian-elevated border-white/16 text-slate-50 rounded-xl px-3 py-2 text-xs font-mono ${wireErrors.memberAmount ? "border-rose-500" : ""}`}
                    />
                    {wireErrors.memberAmount && <p className="text-[11px] text-rose-500 mt-1">{wireErrors.memberAmount}</p>}
                  </div>

                  {!wireOtpSent ? (
                    <button
                      type="button"
                      disabled={sendingWireOtp}
                      onClick={requestWireSms}
                      className="w-full bg-rose-700 hover:bg-rose-800 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
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
                        onChange={(e) => { setWireSmsCode(e.target.value.replace(/\D/g, "")); setWireErrors(prev => ({...prev, wireSmsCode: ""})); }}
                        placeholder="Enter 6-Digit SMS OTP Code"
                        className={`w-full bg-obsidian-elevated border-emerald-500/50 text-slate-50 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center ${wireErrors.wireSmsCode ? "border-rose-500" : ""}`}
                      />
                      {wireErrors.wireSmsCode && <p className="text-[11px] text-rose-500">{wireErrors.wireSmsCode}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={requestWireSms}
                          className="px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold cursor-pointer"
                        >
                          Resend SMS
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                        >
                          Verify SMS & Settle Wire
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
              <Suspense fallback={<SkeletonWidget />}>
                <VirtualDebitCard holderName={user?.business_name || user?.email || "AUTHORIZED SIGNER"} />
              </Suspense>
              <Suspense fallback={<SkeletonWidget />}>
                <ScheduledBillsWidget />
              </Suspense>
            </div>
          )}

          {activeTab === "capital" && (
            <Suspense fallback={<SkeletonWidget />}>
              <FundingPortalCard
                userId={user.id}
                userRole={user?.role}
                token={token}
                onSuccess={fetchDashboard}
                onMessage={setActionMessage}
              />
            </Suspense>
          )}

          {activeTab === "ledger" && (
            <div className="space-y-6">
              <Suspense fallback={<SkeletonWidget />}>
                <StatementExportWidget user={user} wallets={wallets} transactions={transactions} />
              </Suspense>
              <div className="glass-card overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3">Account</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 font-semibold">{tx.account_name}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">{tx.transaction_type}</td>
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

          {activeTab === "team" && (
            <Suspense fallback={<SkeletonWidget />}>
              <TeamPermissionsWidget ownerEmail={user?.email || "admin@vaultcore.us"} />
            </Suspense>
          )}
        </main>
      </div>
      <Suspense fallback={<div />}>
        <SupportChatWidget
          userEmail={user?.email || "Client"}
          wallets={wallets}
          recentTransactions={transactions}
          virtualAccountNumber={user?.accountNumber || user?.virtualAccountNumber || ""}
        />
      </Suspense>
    </div>
  );
}
