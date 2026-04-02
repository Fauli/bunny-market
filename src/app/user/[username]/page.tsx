"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type RecentBet = {
  id: string;
  marketId: string;
  marketTitle: string;
  optionLabel: string;
  amount: number;
  payout: number;
  won: boolean | null;
  createdAt: string;
};

type UserProfile = {
  username: string;
  joinDate: string;
  bunnies: number;
  marketsCreated: number;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  recentBets: RecentBet[];
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProfile(data); });
  }, [username]);

  if (notFound) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-xl">User not found.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  const pending = profile.totalBets - profile.wins - profile.losses;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-20">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            <p className="text-sm text-gray-500">
              Joined {new Date(profile.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">{profile.bunnies.toLocaleString()}</p>
            <p className="text-xs text-gray-500">bunnies</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{profile.totalBets}</p>
            <p className="text-xs text-gray-500">Total Bets</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{profile.wins}</p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{profile.losses}</p>
            <p className="text-xs text-gray-500">Losses</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{profile.marketsCreated}</p>
            <p className="text-xs text-gray-500">Markets Created</p>
          </div>
        </div>

        {profile.totalBets > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
              {profile.wins > 0 && (
                <div className="h-full bg-green-500" style={{ width: `${(profile.wins / profile.totalBets) * 100}%` }} />
              )}
              {pending > 0 && (
                <div className="h-full bg-yellow-500" style={{ width: `${(pending / profile.totalBets) * 100}%` }} />
              )}
              {profile.losses > 0 && (
                <div className="h-full bg-red-500" style={{ width: `${(profile.losses / profile.totalBets) * 100}%` }} />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{profile.winRate}% win rate</span>
              <span>{pending} pending</span>
            </div>
          </div>
        )}
      </div>

      {profile.recentBets.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4">Recent Bets</h2>
          <div className="space-y-2">
            {profile.recentBets.map((bet) => (
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
                      <span className="text-green-400 text-sm font-semibold">Won</span>
                    )}
                    {bet.won === false && (
                      <span className="text-red-400 text-sm font-semibold">Lost</span>
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
