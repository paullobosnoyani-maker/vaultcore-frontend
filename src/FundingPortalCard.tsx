import React, { useState, useEffect } from "react";
import { FileCheck, CheckCircle2 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/funding";

export function FundingPortalCard({ userId, userRole, token, onSuccess, onMessage }: any) {
  const [fullName, setFullName] = useState("");
  const [usState, setUsState] = useState("New York");
  const [ssnLast4, setSsnLast4] = useState("");
  const [fundingType, setFundingType] = useState("BUSINESS_GRANT");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [applications, setApplications] = useState<any[]>([]);

  const loadApps = async () => {
    try {
      const res = await fetch(`${API}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    onMessage("");
    try {
      const res = await fetch(`${API}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          fullName,
          ssnLast4,
          usState,
          fundingType,
          amount: parseFloat(amount),
          purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onMessage(data.message);
      setAmount("");
      setPurpose("");
      loadApps();
    } catch (err: any) {
      onMessage(`Error: ${err.message}`);
    }
  };

  const handleApprove = async (applicationId: string) => {
    onMessage("");
    try {
      const res = await fetch(`${API}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onMessage(data.message);
      loadApps();
      onSuccess();
    } catch (err: any) {
      onMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 shadow-2xs text-slate-900 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-amber-400" />
          <span>US KYC & Grant / Loan Application</span>
        </h2>
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Legal Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">US State</label>
              <input
                type="text"
                required
                value={usState}
                onChange={(e) => setUsState(e.target.value)}
                placeholder="Texas"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">SSN (Last 4 Digits)</label>
              <input
                type="text"
                maxLength={4}
                pattern="\d{4}"
                required
                value={ssnLast4}
                onChange={(e) => setSsnLast4(e.target.value)}
                placeholder="4821"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Program Type</label>
              <select
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
              >
                <option value="BUSINESS_GRANT">US Business Grant</option>
                <option value="GROWTH_LOAN">Capital Growth Loan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Requested Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="100"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000.00"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Purpose of Funds</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Inventory expansion & equipment"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            Submit US KYC & Funding Request
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xs text-slate-900 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Underwriting & Admin Approval Queue</span>
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {applications.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No funding applications submitted yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm">
                    {app.full_name} ({app.us_state} • SSN ***-{app.ssn_last4})
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {app.funding_type} • <span className="text-emerald-400 font-semibold">${parseFloat(app.amount).toLocaleString()}</span> — {app.purpose}
                  </div>
                </div>
                {app.status === "PENDING" && userRole === "ADMIN" ? (
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="bg-rose-800 hover:bg-rose-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shrink-0 cursor-pointer"
                  >
                    Verify KYC & Disburse
                  </button>
                ) : (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0">
                    {app.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
