"use client";

import { useEffect, useState } from "react";
import MarketCard from "@/components/MarketCard";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";

const CATEGORIES = ["All", "General", "Sports", "Politics", "Entertainment", "Science", "Office Bets", "Other"];

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

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"recent" | "trending">("recent");
  const { user } = useUser();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (sort === "trending") params.set("sort", "trending");
    fetch(`/api/markets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMarkets(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setMarkets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, sort]);

  const filtered = markets.filter((m) => {
    if (filter === "active") return !m.resolved;
    if (filter === "resolved") return m.resolved;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">
          <span className="text-white">Bet Bunnies</span>{" "}
          <span className="text-blue-400">on Anything</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create prediction markets and place bets with your real bunnies.
          Set your balance in your profile and start trading.
        </p>
        {!user && (
          <Link
            href="/register"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition text-lg"
          >
            Get Started - It&apos;s Free
          </Link>
        )}
      </div>

      {/* Status Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <button
          onClick={() => setSort(sort === "recent" ? "trending" : "recent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            sort === "trending"
              ? "bg-orange-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          {sort === "trending" ? "Trending" : "Recent"}
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              category === c
                ? "bg-gray-200 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-2">No markets yet</p>
          <p>Be the first to create a prediction market!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
