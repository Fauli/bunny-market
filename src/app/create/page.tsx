"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function CreateMarketPage() {
  const { user } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    optionA: "",
    optionB: "",
    detailA: "",
    detailB: "",
    endDate: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push(`/market/${data.id}`);
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-xl">Please log in to create a market.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create a Market</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Question / Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
            placeholder="e.g., Will it rain tomorrow in Berlin?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
            rows={3}
            placeholder="Add context about this prediction..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
          >
            {["General", "Sports", "Politics", "Entertainment", "Science", "Office Bets", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Option A</label>
              <input
                type="text"
                value={form.optionA}
                onChange={(e) => update("optionA", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g., Yes"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">What does Option A mean?</label>
              <textarea
                value={form.detailA}
                onChange={(e) => update("detailA", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                rows={2}
                placeholder="Describe what this outcome means in detail..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-pink-400 mb-1">Option B</label>
              <input
                type="text"
                value={form.optionB}
                onChange={(e) => update("optionB", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g., No"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">What does Option B mean?</label>
              <textarea
                value={form.detailB}
                onChange={(e) => update("detailB", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                rows={2}
                placeholder="Describe what this outcome means in detail..."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition text-lg"
        >
          {loading ? "Creating..." : "Create Market"}
        </button>
      </form>
    </div>
  );
}
