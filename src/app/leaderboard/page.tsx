"use client";

import { useEffect, useState } from "react";

type Player = {
  id: string;
  username: string;
  bunnies: number;
  _count: { bets: number; markets: number };
};

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Market Specialists</h1>
      <p className="text-gray-400 mb-8">The finest bunny traders in the game.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No players yet.</p>
      ) : (
        <div className="space-y-2">
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-lg px-5 py-4 ${
                i === 0
                  ? "bg-yellow-900/20 border border-yellow-700"
                  : i === 1
                    ? "bg-gray-800/50 border border-gray-600"
                    : i === 2
                      ? "bg-orange-900/15 border border-orange-800"
                      : "bg-gray-900 border border-gray-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-500 w-8 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </span>
                <div>
                  <span className="text-white font-medium">{player.username}</span>
                  <div className="text-xs text-gray-500">
                    {player._count.bets} bets &middot; {player._count.markets} markets created
                  </div>
                </div>
              </div>
              <span className="text-orange-400 font-bold text-lg">
                {player.bunnies.toLocaleString()} 🐰
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
