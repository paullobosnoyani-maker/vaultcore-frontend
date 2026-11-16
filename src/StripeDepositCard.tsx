import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard } from "lucide-react";

const stripePromise = loadStripe("pk_test_51UbHXdAt0D5TFE2UEq368uqN36rduEhsfl0NSFYrcKdlQrUkAAGyfBhsnZcL2nEuKMh51ZdcLsgsEUAmgf3xgINm00D9j84Doq");
 
function CheckoutForm({ wallets, token, onSuccess, onMessage }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [accountId, setAccountId] = useState(wallets[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleStripeDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    onMessage("");

    try {
      const intentRes = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/stripe/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error);

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: cardElement! },
      });

      if (error) throw new Error(error.message);

      if (paymentIntent?.status === "succeeded") {
        const confirmRes = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/users/stripe/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            accountId: accountId || wallets[0]?.id,
          }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData.error);

        onMessage(confirmData.message);
        setAmount("");
        cardElement?.clear();
        onSuccess();
      }
    } catch (err: any) {
      onMessage(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripeDeposit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-600 mb-1">Destination Wallet</label>
        <select
          value={accountId || wallets[0]?.id}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
        >
          {wallets.map((w: any) => (
            <option key={w.id} value={w.id}>{w.account_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Amount (USD)</label>
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
      <div>
        <label className="block text-xs text-slate-600 mb-1">US Debit / Credit Card</label>
        <div className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3">
          <CardElement options={{ style: { base: { color: "#f8fafc", fontSize: "14px" } } }} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
      >
        {processing ? "Verifying with Stripe..." : "Fund via Stripe USD"}
      </button>
    </form>
  );
}

export function StripeDepositCard(props: any) {
  return (
    <div className="bg-white border border-slate-200 shadow-2xs text-slate-900 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-emerald-400" />
        <span>Fund Wallet (US Card)</span>
      </h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
      </Elements>
    </div>
  );
}

