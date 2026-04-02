"use client";

import { Suspense, useEffect, useState } from "react";
import MarketCard from "@/components/MarketCard";
import ActivityFeed from "@/components/ActivityFeed";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";
import { useSearchParams } from "next/navigation";

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
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"recent" | "trending">("recent");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Initialize search from URL param
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearch(q);
      setDebouncedSearch(q);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (sort === "trending") params.set("sort", "trending");
    if (debouncedSearch) params.set("search", debouncedSearch);
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
  }, [category, sort, debouncedSearch]);

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

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search markets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
        />
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

      {/* Markets + Activity */}
      <div className="lg:flex lg:gap-6">
        <div className="lg:flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-48" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl mb-2">No markets found</p>
              <p>Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>
        <div className="lg:w-80 mt-6 lg:mt-0 flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <ActivityFeed limit={15} />
          </div>
        </div>
      </div>
    </div>
  );
}
