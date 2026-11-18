import React, { useState, useEffect } from "react";
import {
  Wallet, ShieldCheck, LogOut, RefreshCw, Send,
  LayoutDashboard, ArrowLeftRight, Landmark, FileText, TrendingUp,
  AlertCircle, CreditCard, Users, Building2, ChevronDown
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

  const fetchDashboard = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${user.id}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      const data = await res.json();
      setWallets(data.wallets || []);
      setTransactions(data.recentTransactions || []);
      if (data.wallets?.length > 0) {
        setSenderId((prev) => prev || data.wallets[0].id);
        if (data.wallets.length > 1) setReceiverId((prev) => prev || data.wallets[1].id);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token && user?.id) fetchDashboard(); }, [token, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setShowAuth(false);
  };

  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    if (!senderId || !receiverId) { setActionMessage("Error: Please select both source and destination accounts."); return; }
    if (senderId === receiverId) { setActionMessage("Error: Choose two different wallets."); return; }
    try {
      const res = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senderAccountId: senderId, receiverAccountId: receiverId, amount: parseFloat(transferAmount), description: "Internal Treasury Allocation" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage("Internal treasury transfer settled.");
      setTransferAmount("");
      fetchDashboard();
    } catch (err: any) { setActionMessage(`Error: ${err.message}`); }
  };

  const submitMemberTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    try {
      const res = await fetch(`${API_URL}/member-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senderUserId: user.id, recipientEmail: memberEmail, amount: parseFloat(memberAmount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage(data.message);
      setMemberEmail("");
      setMemberAmount("");
      fetchDashboard();
    } catch (err: any) { setActionMessage(`Error: ${err.message}`); }
  };

  if (!token) {
    if (!showAuth) return <LandingPage onOpenAuth={(m) => { setIsLogin(m); setShowAuth(true); }} />;
    return <OnboardingWizard initialLoginMode={isLogin} onBackHome={() => setShowAuth(false)} onSuccessAuth={(t, u) => { localStorage.setItem("token", t); localStorage.setItem("user", JSON.stringify(u)); setToken(t); setUser(u); }} />;
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

  const selectClass =
    "w-full appearance-none bg-[#121826] border border-white/15 hover:border-rose-500/50 focus:border-rose-500 focus:outline-none text-slate-100 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium transition cursor-pointer";

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 flex font-sans relative overflow-x-hidden">
      {/* Background ambient glows and full dashboard layout implementation */}
      <aside className="relative z-10 w-64 bg-[#0B0F19]/90 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-700 to-rose-950 border border-rose-500/30 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              VaultCore <span className="text-xs font-semibold text-rose-400">US</span>
            </span>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-rose-900/40 to-rose-950/20 text-white border border-rose-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-rose-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="px-2">
            <div className="text-xs font-bold text-slate-100 truncate">{user?.business_name || user?.email}</div>
            <span
              className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                user?.kyc_status === "VERIFIED"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              CIP: {user?.kyc_status || "PENDING"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-white/5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-[#0B0F19]/80 backdrop-blur-xl">
          <h1 className="text-base font-bold text-white tracking-tight">
            {navItems.find((n) => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("payments")}
              className="bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 border border-rose-500/30 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-rose-950/40 transition cursor-pointer"
            >
              Move Money
            </button>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </header>
