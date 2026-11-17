import React, { useState } from "react";
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock, Building2, UserCheck, MapPin } from "lucide-react";

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
      if (data.requiresOtp) { setOtpPurpose("LOGIN"); setOtpMessage(data.message || ""); setOtpRequired(true); return; }
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certified) {
      setError("Please certify that the beneficial owner and US tax details are accurate.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, fullName, phone, dob,
          streetAddress, city, usState, zipCode,
          businessName: businessName ? `${businessName} (${entityType})` : fullName,
          einOrSsn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (data.requiresOtp) { setOtpPurpose("SIGNUP"); setOtpMessage(data.message || ""); setOtpRequired(true); return; }
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + '/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid verification code');
      onSuccessAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpMessage('');
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + '/api/users/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: otpPurpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      setOtpMessage(data.message || 'A new 6-digit code has been sent.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <button onClick={onBackHome} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-800 cursor-pointer">
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
                <h1 className="font-bold text-lg">{isLogin ? "Client Treasury Sign In" : "Open a VaultCore US Account"}</h1>
                <p className="text-xs text-slate-400">
                  {isLogin ? "Access your commercial checking, cards & grant reserve" : "Complete US CIP & KYC onboarding in 3 quick steps"}
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
              {loading ? "Verifying Code..." : "Verify & Continue to Treasury"}
            </button>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => { setOtpRequired(false); setOtpCode(""); setError(""); }}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Work Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="founder@company.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-800" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-rose-800 hover:bg-rose-900 text-white font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer">
                  {loading ? "Authenticating..." : "Sign In to Treasury"}
                </button>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {[
                    { num: 1, label: "Account & Entity", icon: Building2 },
                    { num: 2, label: "Beneficial Owner", icon: UserCheck },
                    { num: 3, label: "US Address & Tax ID", icon: MapPin },
                  ].map((s) => {
                    const Icon = s.icon;
                    const active = step >= s.num;
                    return (
                      <div key={s.num} className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${active ? "bg-rose-50/70 border-rose-300 text-rose-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{s.num}. {s.label}</span>
                      </div>
                    );
                  })}
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@acmeusa.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Business / Account Name *</label>
                        <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Logistics LLC" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">US Entity Structure *</label>
                         <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800">
                          <option value="LLC">Limited Liability Company (LLC)</option>
                          <option value="C-Corp">Delaware / US C-Corporation</option>
                          <option value="S-Corp">S-Corporation</option>
                          <option value="Sole Prop">Individual / Sole Proprietorship</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!email || !password || !businessName) {
                            setError("Please fill in your email, password, and business name.");
                            return;
                          }
                          setError("");
                          setStep(2);
                        }}
                        className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
                      >
                        <span>Continue to Beneficial Owner</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Signer Legal Full Name *</label>
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As shown on US Passport or Driver License" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (DOB) *</label>
                        <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">US Mobile Phone Number *</label>
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (212) 555-0194" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-between">
                      <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-slate-600 hover:text-slate-950 px-4 py-2 cursor-pointer">
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName || !dob || !phone) {
                            setError("Please enter your legal name, date of birth, and US mobile phone.");
                            return;
                          }
                          setError("");
                          setStep(3);
                        }}
                        className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
                      >
                        <span>Continue to US Address &amp; Tax ID</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">US Street Address (No P.O. Boxes) *</label>
                      <input type="text" required value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="350 Fifth Avenue, Suite 4100" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                        <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                        <select value={usState} onChange={(e) => setUsState(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-800">
                          {US_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP Code *</label>
                        <input type="text" required maxLength={10} value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10118" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IRS EIN or Social Security Number (SSN) *</label>
                      <input type="text" required value={einOrSsn} onChange={(e) => setEinOrSsn(e.target.value)} placeholder="XX-XXXXXXX or XXX-XX-XXXX" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-800" />
                    </div>
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 pt-2 cursor-pointer">
                      <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)} className="mt-0.5 accent-rose-800" />
                      <span>
                        Under penalties of perjury, I certify that the US Taxpayer Identification Number (EIN/SSN), Date of Birth, and physical address provided are accurate and authorize VaultCore US and Evolve Bank &amp; Trust to verify my identity.
                      </span>
                    </label>
                    <div className="pt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setStep(2)} className="text-sm font-semibold text-slate-600 hover:text-slate-950 px-4 py-2 cursor-pointer">
                        &larr; Back
                      </button>
                      <button type="submit" disabled={loading} className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-md transition cursor-pointer">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{loading ? "Provisioning Accounts..." : "Submit Application & Open Account"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(""); setStep(1); }} className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer">
                {isLogin ? "Don't have a VaultCore US account? Start 3-Step Application →" : "Already have an account? Sign In to Treasury →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
