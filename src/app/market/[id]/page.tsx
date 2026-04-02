"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EMOJI_MAP: Record<string, string> = {
  fire: "\u{1F525}",
  bear: "\u{1F43B}",
  rocket: "\u{1F680}",
  skull: "\u{1F480}",
  clown: "\u{1F921}",
  heart: "\u2764\uFE0F",
};

type Bet = {
  id: string;
  amount: number;
  option: string;
  payout: number;
  paidOut: boolean;
  createdAt: string;
  user: { username: string };
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: { username: string };
};

type OddsPoint = {
  totalA: number;
  totalB: number;
  createdAt: string;
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
  reactionCounts: Record<string, number>;
  userReactions: string[];
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [oddsHistory, setOddsHistory] = useState<OddsPoint[]>([]);

  const fetchMarket = async () => {
    const res = await fetch(`/api/markets/${id}`);
    if (res.ok) {
      setMarket(await res.json());
    }
  };

  const fetchComments = async () => {
    const res = await fetch(`/api/markets/${id}/comments`);
    if (res.ok) setComments(await res.json());
  };

  const fetchOdds = async () => {
    const res = await fetch(`/api/markets/${id}/odds`);
    if (res.ok) setOddsHistory(await res.json());
  };

  useEffect(() => {
    fetchMarket();
    fetchComments();
    fetchOdds();
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
    await Promise.all([fetchMarket(), fetchOdds(), refresh()]);
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

  const handleDeleteMarket = async () => {
    if (!confirm("Delete this entire market? All bets will be refunded.")) return;
    setLoading(true);
    await fetch(`/api/markets/${id}`, { method: "DELETE" });
    setLoading(false);
    router.push("/");
  };

  const handleDeleteBet = async (betId: string) => {
    if (!confirm("Delete this bet? The user will be refunded.")) return;
    await fetch(`/api/bets/${betId}`, { method: "DELETE" });
    await Promise.all([fetchMarket(), refresh()]);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/markets/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    if (res.ok) {
      setCommentText("");
      fetchComments();
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user || !market) return;
    // Optimistic update
    const had = market.userReactions.includes(emoji);
    setMarket({
      ...market,
      reactionCounts: {
        ...market.reactionCounts,
        [emoji]: (market.reactionCounts[emoji] || 0) + (had ? -1 : 1),
      },
      userReactions: had
        ? market.userReactions.filter((e) => e !== emoji)
        : [...market.userReactions, emoji],
    });
    await fetch(`/api/markets/${id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  };

  const oddsChartData = oddsHistory.map((p) => {
    const t = p.totalA + p.totalB;
    return {
      time: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      [`${market?.optionA || "A"} %`]: t > 0 ? Math.round((p.totalA / t) * 100) : 50,
      [`${market?.optionB || "B"} %`]: t > 0 ? Math.round((p.totalB / t) * 100) : 50,
    };
  });

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

      <div className="text-sm text-gray-500 mb-4">
        Created by <Link href={`/user/${market.creator.username}`} className="text-gray-300 hover:text-blue-400 transition">{market.creator.username}</Link> &middot; Ends{" "}
        {new Date(market.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(EMOJI_MAP).map(([key, emoji]) => {
          const count = market.reactionCounts?.[key] || 0;
          const active = market.userReactions?.includes(key);
          return (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              disabled={!user}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition border ${
                active
                  ? "bg-blue-900/40 border-blue-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
              } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs font-medium">{count}</span>}
            </button>
          );
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

      {/* Admin Controls */}
      {user?.isAdmin && (
        <div className="bg-red-950/30 border border-red-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-red-300">Admin</h2>
          <button
            onClick={handleDeleteMarket}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            Delete Market
          </button>
          <p className="text-xs text-gray-500 mt-2">All bets will be refunded if the market is not resolved.</p>
        </div>
      )}

      {/* Settlement Summary */}
      {market.resolved && market.winner && market.bets.length > 0 && (() => {
        const winnerLabel = market.winner === "A" ? market.optionA : market.optionB;
        const winningPool = market.winner === "A" ? market.totalA : market.totalB;
        const losers = market.bets.filter((b) => b.option !== market.winner);
        const winners = market.bets.filter((b) => b.option === market.winner);

        // Aggregate by user
        const loserTotals = new Map<string, number>();
        losers.forEach((b) => {
          loserTotals.set(b.user.username, (loserTotals.get(b.user.username) || 0) + b.amount);
        });
        const winnerTotals = new Map<string, { bet: number; payout: number }>();
        winners.forEach((b) => {
          const prev = winnerTotals.get(b.user.username) || { bet: 0, payout: 0 };
          winnerTotals.set(b.user.username, { bet: prev.bet + b.amount, payout: prev.payout + b.payout });
        });

        // Calculate transfers: each loser distributes to each winner proportionally
        const transfers: { from: string; to: string; amount: number }[] = [];
        loserTotals.forEach((lostAmount, loserName) => {
          winnerTotals.forEach(({ bet: winBet }, winnerName) => {
            if (loserName === winnerName) return;
            const transfer = winningPool > 0 ? Math.floor((winBet / winningPool) * lostAmount) : 0;
            if (transfer > 0) {
              transfers.push({ from: loserName, to: winnerName, amount: transfer });
            }
          });
        });

        return (
          <div className="bg-green-950/30 border border-green-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-1 text-green-300">Settlement</h2>
            <p className="text-sm text-gray-400 mb-4">
              Outcome: <span className="text-white font-medium">{winnerLabel}</span> won
            </p>

            {/* Winners */}
            {winnerTotals.size > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Winners</h3>
                <div className="space-y-1">
                  {Array.from(winnerTotals).map(([name, { bet, payout }]) => (
                    <div key={name} className="flex justify-between items-center bg-gray-900/50 rounded-lg px-3 py-2 text-sm">
                      <Link href={`/user/${name}`} className="text-green-400 font-medium hover:underline">{name}</Link>
                      <span className="text-gray-300">
                        bet {bet.toLocaleString()} &rarr; gets <span className="text-green-400 font-semibold">{payout.toLocaleString()}</span> 🐰
                        <span className="text-gray-500 ml-1">(+{(payout - bet).toLocaleString()} profit)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Losers */}
            {loserTotals.size > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Losers</h3>
                <div className="space-y-1">
                  {Array.from(loserTotals).map(([name, amount]) => (
                    <div key={name} className="flex justify-between items-center bg-gray-900/50 rounded-lg px-3 py-2 text-sm">
                      <Link href={`/user/${name}`} className="text-red-400 font-medium hover:underline">{name}</Link>
                      <span className="text-red-400">-{amount.toLocaleString()} 🐰</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transfers */}
            {transfers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Bunny Transfers</h3>
                <div className="space-y-1">
                  {transfers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 text-sm">
                      <Link href={`/user/${t.from}`} className="text-red-400 font-medium hover:underline">{t.from}</Link>
                      <span className="text-gray-500">&rarr;</span>
                      <Link href={`/user/${t.to}`} className="text-green-400 font-medium hover:underline">{t.to}</Link>
                      <span className="ml-auto text-orange-400 font-semibold">{t.amount.toLocaleString()} 🐰</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
                  <Link href={`/user/${bet.user.username}`} onClick={(e) => e.stopPropagation()} className="text-sm text-gray-300 font-medium hover:text-blue-400 transition">{bet.user.username}</Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bet.option === "A" ? "bg-blue-900 text-blue-300" : "bg-pink-900 text-pink-300"
                  }`}>
                    {bet.option === "A" ? market.optionA : market.optionB}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-orange-400">{bet.amount.toLocaleString()} 🐰</span>
                  <span className="text-xs text-gray-500">
                    {new Date(bet.createdAt).toLocaleDateString()}
                  </span>
                  {user?.isAdmin && !market.resolved && (
                    <button
                      onClick={() => handleDeleteBet(bet.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                      title="Delete bet and refund"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Odds History Chart */}
      {oddsChartData.length > 1 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Odds History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={oddsChartData}>
              <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey={`${market.optionA} %`} stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={`${market.optionB} %`} stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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

      {/* Comments */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>

        {user && (
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              Post
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex justify-between items-center mb-1">
                  <Link href={`/user/${c.user.username}`} className="text-sm font-medium text-gray-300 hover:text-blue-400 transition">{c.user.username}</Link>
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
