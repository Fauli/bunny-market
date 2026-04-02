"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ActivityItem = {
  type: "bet" | "market_created" | "comment" | "resolution";
  username: string;
  marketId: string;
  marketTitle: string;
  detail: string;
  timestamp: string;
};

const TYPE_ICONS: Record<string, string> = {
  bet: "\u{1F430}",
  market_created: "\u{2795}",
  comment: "\u{1F4AC}",
  resolution: "\u{2705}",
};

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ limit = 15 }: { limit?: number }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/activity?limit=${limit}`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white mb-3">Activity</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-14 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Activity</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5">
            <div className="flex items-start gap-2">
              <span className="text-xs mt-0.5">{TYPE_ICONS[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-snug">
                  {item.username && (
                    <Link href={`/user/${item.username}`} className="text-white font-medium hover:text-blue-400 transition">
                      {item.username}
                    </Link>
                  )}{" "}
                  {item.detail}
                  {" in "}
                  <Link href={`/market/${item.marketId}`} className="text-blue-400 hover:underline">
                    {item.marketTitle.length > 40 ? item.marketTitle.slice(0, 40) + "..." : item.marketTitle}
                  </Link>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{relativeTime(item.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
