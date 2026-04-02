"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

type Bet = {
  id: string;
  amount: number;
  option: string;
  createdAt: string;
  user: { username: string };
};

type Market = {
  id: string;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  detailA: string;
  detailB: string;
  totalA: number;
  totalB: number;
  endDate: string;
  resolved: boolean;
  winner: string | null;
  creatorId: string;
  creator: { username: string };
  bets: Bet[];
};

export default function MarketPage() {
  const { id } = useParams();
  const { user, refresh } = useUser();
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMarket = async () => {
    const res = await fetch(`/api/markets/${id}`);
    if (res.ok) {
      setMarket(await res.json());
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [id]);

  if (!market) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  const total = market.totalA + market.totalB;
  const pctA = total > 0 ? Math.round((market.totalA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const isEnded = new Date(market.endDate) < new Date();
  const isCreator = user?.id === market.creatorId;

  const handleBet = async () => {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/markets/${id}/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: betAmount, option: selectedOption }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    await Promise.all([fetchMarket(), refresh()]);
  };

  const handleResolve = async (winner: "A" | "B") => {
    if (!confirm(`Resolve this market with "${winner === "A" ? market.optionA : market.optionB}" as the winner?`)) return;
    setLoading(true);
    await fetch(`/api/markets/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner }),
    });
    setLoading(false);
    await Promise.all([fetchMarket(), refresh()]);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-20">
      {/* Header */}
      <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
        &larr; Back to markets
      </button>

      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold">{market.title}</h1>
        {market.resolved ? (
          <span className="text-sm bg-green-900 text-green-300 px-3 py-1 rounded-full">Resolved</span>
        ) : isEnded ? (
          <span className="text-sm bg-red-900 text-red-300 px-3 py-1 rounded-full">Ended</span>
        ) : (
          <span className="text-sm bg-blue-900 text-blue-300 px-3 py-1 rounded-full">Active</span>
        )}
      </div>

      {market.description && <p className="text-gray-400 mb-6">{market.description}</p>}

      <div className="text-sm text-gray-500 mb-8">
        Created by <span className="text-gray-300">{market.creator.username}</span> &middot; Ends{" "}
        {new Date(market.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Option A */}
        <div
          className={`border rounded-xl p-5 transition cursor-pointer ${
            selectedOption === "A"
              ? "border-blue-500 bg-blue-950/30"
              : "border-gray-800 bg-gray-900 hover:border-gray-600"
          } ${market.winner === "A" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setSelectedOption("A")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-400">{market.optionA}</h3>
            <span className="text-2xl font-bold text-white">{pctA}%</span>
          </div>
          {market.detailA && <p className="text-gray-400 text-sm mb-3">{market.detailA}</p>}
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctA}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{market.totalA.toLocaleString()} bunnies</p>
          {market.winner === "A" && (
            <div className="mt-2 text-green-400 font-semibold text-sm">Winner!</div>
          )}
        </div>

        {/* Option B */}
        <div
          className={`border rounded-xl p-5 transition cursor-pointer ${
            selectedOption === "B"
              ? "border-pink-500 bg-pink-950/30"
              : "border-gray-800 bg-gray-900 hover:border-gray-600"
          } ${market.winner === "B" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setSelectedOption("B")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-pink-400">{market.optionB}</h3>
            <span className="text-2xl font-bold text-white">{pctB}%</span>
          </div>
          {market.detailB && <p className="text-gray-400 text-sm mb-3">{market.detailB}</p>}
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${pctB}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{market.totalB.toLocaleString()} bunnies</p>
          {market.winner === "B" && (
            <div className="mt-2 text-green-400 font-semibold text-sm">Winner!</div>
          )}
        </div>
      </div>

      {/* Bet Form */}
      {user && !market.resolved && !isEnded && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Place Your Bet</h2>

          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Amount (bunnies)</label>
              <input
                type="number"
                min={1}
                max={user.bunnies}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Betting on</label>
              <div className={`px-4 py-2.5 rounded-lg font-medium ${
                selectedOption === "A" ? "bg-blue-900/50 text-blue-400" : "bg-pink-900/50 text-pink-400"
              }`}>
                {selectedOption === "A" ? market.optionA : market.optionB}
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={handleBet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-8 py-2.5 rounded-lg transition"
              >
                {loading ? "..." : "Bet"}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You have {user.bunnies.toLocaleString()} bunnies available
          </p>
        </div>
      )}

      {/* Resolve (creator only) */}
      {isCreator && !market.resolved && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-yellow-300">Resolve Market</h2>
          <p className="text-sm text-gray-400 mb-4">As the creator, you can resolve this market by selecting the winning outcome.</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleResolve("A")}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              {market.optionA} wins
            </button>
            <button
              onClick={() => handleResolve("B")}
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              {market.optionB} wins
            </button>
          </div>
        </div>
      )}

      {/* Recent Bets */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {market.bets.length === 0 ? (
          <p className="text-gray-500">No bets yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {market.bets.map((bet) => (
              <div key={bet.id} className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 font-medium">{bet.user.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bet.option === "A" ? "bg-blue-900 text-blue-300" : "bg-pink-900 text-pink-300"
                  }`}>
                    {bet.option === "A" ? market.optionA : market.optionB}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-orange-400">{bet.amount.toLocaleString()} 🥕</span>
                  <span className="text-xs text-gray-500">
                    {new Date(bet.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pool Info */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">Pool Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-orange-400">{total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Pool</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{market.totalA.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{market.optionA}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-400">{market.totalB.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{market.optionB}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
