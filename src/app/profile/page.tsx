"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import Link from "next/link";

type BetHistory = {
  id: string;
  marketId: string;
  marketTitle: string;
  option: string;
  optionLabel: string;
  amount: number;
  payout: number;
  profit: number;
  won: boolean | null;
  createdAt: string;
};

type Stats = {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  totalProfit: number;
  history: BetHistory[];
};

export default function ProfilePage() {
  const { user, refresh } = useUser();
  const [bunnies, setBunnies] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (user) {
      setBunnies(user.bunnies);
      fetch("/api/auth/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-xl">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async () => {
    setMessage("");
    setSaving(true);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bunnies }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    await refresh();
    setMessage("Balance updated!");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-20">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <p className="text-white text-lg font-medium">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Balance</label>
            <p className="text-orange-400 text-2xl font-bold">{user.bunnies.toLocaleString()} 🐰</p>
          </div>

          <hr className="border-gray-800" />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Set Bunny Balance</label>
            <p className="text-xs text-gray-500 mb-2">
              Enter how many real bunnies you have.
            </p>
            <input
              type="number"
              min={0}
              max={1000000}
              value={bunnies}
              onChange={(e) => setBunnies(Math.min(1_000_000, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {message && (
            <div className={`text-sm rounded-lg p-3 ${
              message === "Balance updated!"
                ? "bg-green-900/50 border border-green-800 text-green-300"
                : "bg-red-900/50 border border-red-800 text-red-300"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {saving ? "Saving..." : "Update Balance"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Betting Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
              <p className="text-xs text-gray-500">Total Bets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
              <p className="text-xs text-gray-500">Losses</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {stats.totalProfit >= 0 ? "+" : ""}{stats.totalProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Profit/Loss</p>
            </div>
          </div>
          {stats.totalBets > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                {stats.wins > 0 && (
                  <div className="h-full bg-green-500" style={{ width: `${(stats.wins / stats.totalBets) * 100}%` }} />
                )}
                {stats.pending > 0 && (
                  <div className="h-full bg-yellow-500" style={{ width: `${(stats.pending / stats.totalBets) * 100}%` }} />
                )}
                {stats.losses > 0 && (
                  <div className="h-full bg-red-500" style={{ width: `${(stats.losses / stats.totalBets) * 100}%` }} />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0}% win rate</span>
                <span>{stats.pending} pending</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bet History */}
      {stats && stats.history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4">Bet History</h2>
          <div className="space-y-2">
            {stats.history.map((bet) => (
              <Link key={bet.id} href={`/market/${bet.marketId}`}>
                <div className="flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 rounded-lg px-4 py-3 transition">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-white font-medium truncate">{bet.marketTitle}</p>
                    <p className="text-xs text-gray-500">
                      {bet.optionLabel} &middot; {bet.amount.toLocaleString()} 🐰 &middot;{" "}
                      {new Date(bet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    {bet.won === true && (
                      <span className="text-green-400 text-sm font-semibold">+{bet.profit.toLocaleString()} 🐰</span>
                    )}
                    {bet.won === false && (
                      <span className="text-red-400 text-sm font-semibold">{bet.profit.toLocaleString()} 🐰</span>
                    )}
                    {bet.won === null && (
                      <span className="text-yellow-400 text-xs px-2 py-0.5 bg-yellow-900/50 rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
