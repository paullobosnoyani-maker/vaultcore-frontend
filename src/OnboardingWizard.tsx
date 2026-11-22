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

const SECURITY_QUESTIONS = [
  "What was the name of your first elementary school?",
  "In what city or town was your first full-time job?",
  "What is the middle name of your oldest sibling?",
  "What was the make and model of your first car?",
  "What street did you grow up on as a child?",
  "What is your maternal grandmother's maiden name?"
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
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetQ1, setResetQ1] = useState<string | null>(null);
  const [resetQ2, setResetQ2] = useState<string | null>(null);
  const [resetA1, setResetA1] = useState("");
  const [resetA2, setResetA2] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

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
  const [securityQuestion1, setSecurityQuestion1] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState(SECURITY_QUESTIONS[1]);
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [certified, setCertified] = useState(false);

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
    if (!securityAnswer1.trim() || !securityAnswer2.trim()) {
      setError("Please answer both security questions to protect your account.");
      return;
    }
    if (securityQuestion1 === securityQuestion2) {
      setError("Please choose two different security questions.");
      return;
    }
    if (!certified) {
      setError("Please certify that your identity and US tax details are accurate.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const isoDob = `${dob.slice(6, 10)}-${dob.slice(0, 2)}-${dob.slice(3, 5)}`;
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
          dob: isoDob,
          streetAddress,
          city,
          usState,
          zipCode,
          businessName: resolvedBusinessName,
          einOrSsn,
          accountCategory,
          securityQuestion1,
          securityAnswer1,
          securityQuestion2,
          securityAnswer2,
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
  const handleInitiateReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/forgot-password/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to find account");
      setResetQ1(data.securityQuestion1 || null);
      setResetQ2(data.securityQuestion2 || null);
      setOtpMessage(data.message || "6-digit reset code sent to your email.");
      setResetStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/forgot-password/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: resetCode,
          answer1: resetA1,
          answer2: resetA2,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");
      setForgotMode(false);
      setResetStep(1);
      setResetCode("");
      setResetA1("");
      setResetA2("");
      setNewPassword("");
      setResetSuccess(data.message || "Password updated! Please sign in with your new password.");
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
                         ) : forgotMode ? (
              resetStep === 1 ? (
                <form onSubmit={handleInitiateReset} className="space-y-5 max-w-md mx-auto">
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    Enter your registered VaultCore US email address. We will send a 6-digit recovery code and prompt your security questions.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Registered Email Address
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-800 hover:bg-rose-900 text-white font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer"
                  >
                    {loading ? "Sending Recovery Code..." : "Send 6-Digit Recovery Code"}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setForgotMode(false); setError(""); }}
                      className="text-xs font-semibold text-slate-600 hover:text-rose-800 underline cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-4 max-w-md mx-auto">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 text-xs font-medium">
                    {otpMessage}
                  </div>
                  {resetQ1 && resetQ2 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">{resetQ1}</label>
                        <input
                          type="text"
                          required
                          value={resetA1}
                          onChange={(e) => setResetA1(e.target.value)}
                          placeholder="Your answer"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">{resetQ2}</label>
                        <input
                          type="text"
                          required
                          value={resetA2}
                          onChange={(e) => setResetA2(e.target.value)}
                          placeholder="Your answer"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Email Recovery Code *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-rose-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min. 8 Characters) *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-800 hover:bg-rose-900 text-white font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer"
                  >
                    {loading ? "Updating Password..." : "Verify & Reset Password"}
                  </button>
                </form>
             )
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
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setResetStep(1); setError(""); setResetSuccess(""); }}
                      className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

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
                      label: accountCategory === "personal" ? "Address, SSN & 2FA" : "Address, EIN & 2FA",
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

                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs mb-0.5">
                            <Building2 className="w-4 h-4 text-rose-800" />
                            <span>Business / Commercial</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Business Checkings, Business Savings &amp; Reserve
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {accountCategory === "personal" ? "Personal Email Address *" : "Work Email Address *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={accountCategory === "personal" ? "alex.morgan@gmail.com" : "alex@acmeusa.com"}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Create Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        />
                      </div>
                    </div>

                    {accountCategory === "business" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Legal Business / Entity Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Acme Logistics LLC"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            US Entity Structure *
                          </label>
                          <select value={entityType}
                            onChange={(e) =>
                           setEntityType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                          >
                            <option value="LLC">Limited Liability Company (LLC)</option>
                            <option value="C-Corp">Delaware / US C-Corporation</option>
                            <option value="S-Corp">S-Corporation</option>
                            <option value="Sole Prop">Individual / Sole Proprietorship</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!email || !password) {
                            setError("Please fill in your email address and password.");
                            return;
                          }
                          if (accountCategory === "business" && !businessName) {
                            setError("Please enter your legal business name.");
                            return;
                          }
                          setError("");
                          setStep(2);
                        }}
                        className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
                      >
                                              <span>Continue to Personal Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {accountCategory === "personal"
                          ? "Legal Full Name *"
                          : "Authorized Signer Legal Full Name *"}

                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="As shown on US Passport, State ID, or Driver License"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date of Birth (MM/DD/YYYY) *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          value={dob}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                            if (d.length <= 2) setDob(d);
                            else if (d.length <= 4) setDob(`${d.slice(0, 2)}/${d.slice(2)}`);
                            else setDob(`${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`);
                          }}
                          placeholder="04/12/1990"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Phone Number *
                        </label>
                        <input
                          type="tel"
                          inputMode="tel"
                          required
                          maxLength={17}
                          value={phone}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^\d+\s()-]/g, "");
                            setPhone(cleaned);
                          }}
                          placeholder="+1 (212) 555-0194"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800"
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-950 px-4 py-2 cursor-pointer"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName || !dob || !phone) {
                            setError("Please enter your legal full name, date of birth, and mobile phone number.");
                            return;
                          }
                          const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob);
                         const month = match ? parseInt(match.at(1) || "0", 10) : 0;
                         const day = match ? parseInt(match.at(2) || "0", 10) : 0;
                         const year = match ? parseInt(match.at(3) || "0", 10) : 0;

                          const maxYear = new Date().getFullYear() - 18;
                          if (!match || month < 1 || month > 12 || day < 1 || day > 31 || year < 1920 || year > maxYear) {
                            setError(`Enter a valid date of birth (MM/DD/YYYY) with birth year between 1920 and ${maxYear}.`);
                            return;
                          }
                          const phoneDigits = phone.replace(/\D/g, "");
                          if (phoneDigits.length < 10 || phoneDigits.length > 15) {
                            setError("Please enter a valid mobile phone number (10 to 15 digits).");
                            return;
                          }
                          setError("");
                          setStep(3);
                        }}
                        className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
                      >
                        <span>
                          {accountCategory === "personal" ? "Continue to Address & SSN" : "Continue to Address & EIN"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {accountCategory === "personal"
                          ? "Residential Street Address (No P.O. Boxes) *"
                          : "US Street Address (No P.O. Boxes) *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="350 Fifth Avenue, Apt 4B"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="New York"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                        <select
                          value={usState}
                          onChange={(e) => setUsState(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800"
                        >
                          {US_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="10118"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {accountCategory === "personal"
                          ? "Social Security Number (SSN) *"
                          : "IRS Employer Identification Number (EIN) *"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={accountCategory === "personal" ? 11 : 10}
                        value={einOrSsn}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                          if (accountCategory === "personal") {
                            if (digits.length <= 3) setEinOrSsn(digits);
                            else if (digits.length <= 5) setEinOrSsn(`${digits.slice(0, 3)}-${digits.slice(3)}`);
                            else setEinOrSsn(`${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`);
                          } else {
                            if (digits.length <= 2) setEinOrSsn(digits);
                            else setEinOrSsn(`${digits.slice(0, 2)}-${digits.slice(2)}`);
                          }
                        }}
                        placeholder={accountCategory === "personal" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="text-xs font-bold text-slate-800">Account Recovery Security Questions *</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Security Question 1</label>
                          <select
                            value={securityQuestion1}
                            onChange={(e) => setSecurityQuestion1(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-800"
                          >
                            {SECURITY_QUESTIONS.map((q) => (
                              <option key={q} value={q}>
                                {q}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Answer 1 *</label>
                          <input
                            type="text"
                            required
                            value={securityAnswer1}
                            onChange={(e) => setSecurityAnswer1(e.target.value)}
                            placeholder="Your secret answer"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-800"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Security Question 2</label>
                          <select
                            value={securityQuestion2}
                            onChange={(e) => setSecurityQuestion2(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-800"
                          >
                            {SECURITY_QUESTIONS.map((q) => (
                              <option key={q} value={q}>
                                {q}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Answer 2 *</label>
                          <input
                            type="text"
                            required
                            value={securityAnswer2}
                            onChange={(e) => setSecurityAnswer2(e.target.value)}
                            placeholder="Your secret answer"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-800"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-slate-600 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={certified}
                        onChange={(e) => setCertified(e.target.checked)}
                        className="mt-0.5 accent-rose-800"
                      />
                      <span>
                        Under penalties of perjury, I certify that the{" "}
                        {accountCategory === "personal" ? "Social Security Number (SSN)" : "IRS EIN"}, Date of Birth, and
                        physical address provided are accurate and authorize VaultCore US and Evolve Bank &amp; Trust
                        to verify my identity.
                      </span>
                    </label>
                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-950 px-4 py-2 cursor-pointer"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{loading ? "Provisioning Accounts..." : "Submit Application & Open Account"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setStep(1);
                }}
                className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
              >
                {isLogin
                  ? "Don't have a VaultCore US account? Start 3-Step Application →"
                  : "Already have an account? Sign In to Account →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
