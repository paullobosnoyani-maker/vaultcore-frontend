import React, { useState, useEffect } from "react";
import {
  Wallet, LogOut, RefreshCw,
  LayoutDashboard, ArrowLeftRight, Landmark, FileText, TrendingUp,
  AlertCircle, CreditCard, Users, Building2, Menu, X
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
          recipientEmail: memberEmail,
          amount: parseFloat(memberAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage(data.message);
      setMemberEmail("");
      setMemberAmount("");
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
                src="/logo.png"
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
