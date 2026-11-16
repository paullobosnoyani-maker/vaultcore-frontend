import React, { useState } from "react";
import { Landmark } from "lucide-react";

export function AchWithdrawalCard({ token, onSuccess, onMessage }: any) {
  const [bankName, setBankName] = useState("JPMorgan Chase Bank");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onMessage("");
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/payout/ach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankName,
          routingNumber,
          accountNumber,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onMessage(data.message);
      setRoutingNumber("");
      setAccountNumber("");
      setAmount("");
      onSuccess();
    } catch (err: any) {
      onMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-2xs text-slate-900 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-rose-400" />
        <span>Withdraw to US Bank (ACH)</span>
      </h2>
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-600 mb-1">US Bank Institution</label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
          >
            <option value="JPMorgan Chase Bank">JPMorgan Chase Bank</option>
            <option value="Bank of America">Bank of America</option>
            <option value="Wells Fargo Bank">Wells Fargo Bank</option>
            <option value="Citibank N.A.">Citibank N.A.</option>
            <option value="Capital One">Capital One</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">ABA Routing (9 Digits)</label>
            <input
              type="text"
              maxLength={9}
              required
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="021000021"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Account Number</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Withdrawal Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="250.00"
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
        >
          {loading ? "Initiating ACH..." : "Withdraw via US ACH"}
        </button>
      </form>
    </div>
  );
}
