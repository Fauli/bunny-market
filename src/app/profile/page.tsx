"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";

export default function ProfilePage() {
  const { user, refresh } = useUser();
  const [bunnies, setBunnies] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) setBunnies(user.bunnies);
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
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
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
    </div>
  );
}
