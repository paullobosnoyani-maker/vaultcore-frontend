import React, { useState } from "react";
import {
  ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock,
  Building2, UserCheck, MapPin, User
} from "lucide-react";

interface Props {
  initialLoginMode: boolean;
  onBackHome: () => void;
  onSuccessAuth: (token: string, user: any) => void;
}

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

export function OnboardingWizard({ initialLoginMode, onBackHome, onSuccessAuth }: Props) {
  const [isLogin, setIsLogin] = useState(initialLoginMode);
  const [accountCategory, setAccountCategory] = useState<"personal" | "business">("personal");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"SIGNUP" | "LOGIN">("LOGIN");
  const [otpMessage, setOtpMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [entityType, setEntityType] = useState("LLC");

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [usState, setUsState] = useState("New York");
  const [zipCode, setZipCode] = useState("");
  const [einOrSsn, setEinOrSsn] = useState("");
  const [certified, setCertified] = useState(false);

  const maxDobDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString()
    .split("T")[0];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.requiresOtp) {
        setOtpPurpose("LOGIN");
        setOtpMessage(data.message || "");
        setOtpRequired(true);
        return;
      }
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taxDigits = einOrSsn.replace(/\D/g, "");
    if (taxDigits.length !== 9) {
      setError(
        accountCategory === "personal"
          ? "Please enter a valid 9-digit Social Security Number (XXX-XX-XXXX)."
          : "Please enter a valid 9-digit IRS EIN (XX-XXXXXXX)."
      );
      return;
    }
    if (!certified) {
      setError("Please certify that your identity and US tax details are accurate.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const resolvedBusinessName =
        accountCategory === "personal"
          ? `${fullName} (Personal Checkings)`
          : businessName
          ? `${businessName} (${entityType})`
          : fullName;

      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          dob,
          streetAddress,
          city,
          usState,
          zipCode,
          businessName: resolvedBusinessName,
          einOrSsn,
          accountCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (data.requiresOtp) {
        setOtpPurpose("SIGNUP");
        setOtpMessage(data.message || "");
        setOtpRequired(true);
        return;
      }
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid verification code");
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setOtpMessage("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: otpPurpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");
      setOtpMessage(data.message || "A new 6-digit code has been sent.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <button
          onClick={onBackHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to VaultCore US</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-rose-800" />
          <span>256-Bit TLS Encrypted &bull; USA PATRIOT Act CIP Compliant</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-slate-950 px-8 py-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">
                  {isLogin ? "Client Account Sign In" : "Open a VaultCore US Account"}
                </h1>
                <p className="text-xs text-slate-400">
                  {isLogin
                    ? "Access your personal or business checkings, savings & cards"
                    : "Complete US CIP & KYC onboarding in 3 quick steps"}
                </p>
              </div>
            </div>
            {!isLogin && (
              <span className="text-xs font-mono bg-rose-900/50 border border-rose-700 text-rose-200 px-3 py-1 rounded-full">
                Step {step} of 3
              </span>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
                {error}
              </div>
            )}

            {otpRequired ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5 max-w-md mx-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                  {otpMessage || `We sent a 6-digit verification code to ${email}.`}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-rose-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-rose-800 hover:bg-rose-900 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer"
                >
                  {loading ? "Verifying Code..." : "Verify & Continue to Account"}
                </button>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequired(false);
                      setOtpCode("");
                      setError("");
                    }}
                    className="hover:text-slate-800 underline cursor-pointer"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResendOtp}
                    className="text-rose-800 hover:text-rose-900 font-semibold underline cursor-pointer"
                  >
                    Resend 6-Digit Code
                  </button>
                </div>
              </form>
            ) : isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-800 hover:bg-rose-900 text-white font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer"
                >
                  {loading ? "Authenticating..." : "Sign In to VaultCore US"}
                </button>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {[
                    {
                      num: 1,
                      label: accountCategory === "personal" ? "Account Type" : "Account & Entity",
                      icon: accountCategory === "personal" ? User : Building2,
                    },
                    { num: 2, label: "Personal Details", icon: UserCheck },
                    {
                      num: 3,
                      label: accountCategory === "personal" ? "Address & SSN" : "Address & EIN",
                      icon: MapPin,
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    const active = step >= s.num;
                    return (
                      <div
                        key={s.num}
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          active
                            ? "bg-rose-50/70 border-rose-300 text-rose-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {s.num}. {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Account Category *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountCategory("personal");
                            setEinOrSsn("");
                          }}
                          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                            accountCategory === "personal"
                              ? "bg-rose-50/80 border-rose-700 text-rose-950 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs mb-0.5">
                            <User className="w-4 h-4 text-rose-800" />
                            <span>Personal Account</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Personal Checkings, Personal Savings &amp; Visa Card
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountCategory("business");
                            setEinOrSsn("");
                          }}
                          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                            accountCategory === "business"
                              ? "bg-rose-50/80 border-rose-700 text-rose-950 shadow-2xs"
