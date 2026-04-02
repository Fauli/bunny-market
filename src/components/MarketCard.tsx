"use client";

import Link from "next/link";

type Market = {
  id: string;
  title: string;
  description: string;
  category: string;
  optionA: string;
  optionB: string;
  totalA: number;
  totalB: number;
  endDate: string;
  resolved: boolean;
  winner: string | null;
  creator: { username: string };
  _count: { bets: number };
};

export default function MarketCard({ market }: { market: Market }) {
  const total = market.totalA + market.totalB;
  const pctA = total > 0 ? Math.round((market.totalA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const isEnded = new Date(market.endDate) < new Date();

  return (
    <Link href={`/market/${market.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-semibold text-lg leading-tight flex-1 mr-3">{market.title}</h3>
          {market.resolved ? (
            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full whitespace-nowrap">
              Resolved
            </span>
          ) : isEnded ? (
            <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full whitespace-nowrap">
              Ended
            </span>
          ) : (
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full whitespace-nowrap">
              Active
            </span>
          )}
        </div>

        {market.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{market.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className={`font-medium ${market.winner === "A" ? "text-green-400" : "text-blue-400"}`}>
                  {market.optionA}
                </span>
                <span className="text-gray-400">{pctA}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${market.winner === "A" ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${pctA}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className={`font-medium ${market.winner === "B" ? "text-green-400" : "text-pink-400"}`}>
                  {market.optionB}
                </span>
                <span className="text-gray-400">{pctB}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${market.winner === "B" ? "bg-green-500" : "bg-pink-500"}`}
                  style={{ width: `${pctB}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 text-xs text-gray-500 gap-2">
          <span className="whitespace-nowrap">{total.toLocaleString()} 🐰 in pool</span>
          <span className="bg-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap">{market.category}</span>
          <span className="truncate min-w-0 text-right">by {market.creator.username}</span>
        </div>
      </div>
    </Link>
  );
}
