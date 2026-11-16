import React, { useState } from "react";
import { Send } from "lucide-react";

export function MemberTransferCard({ userId, token, onSuccess, onMessage }: any) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onMessage("");
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/member-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderUserId: userId,
          recipientEmail,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onMessage(data.message);
      setRecipientEmail("");
      setAmount("");
      onSuccess();
    } catch (err: any) {
      onMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-violet-400" />
        <span>Send to Member</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Recipient Email</label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="lasun007@gmail.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-violet-500 hover:bg-violet-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
        >
          Send Instant P2P Funds
        </button>
      </form>
    </div>
  );
}

