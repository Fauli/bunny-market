"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center">
            <Image src="/bunny-market-logo.png" alt="Bunny Market" width={180} height={48} priority />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-white transition">
              How It Works
            </Link>
            {user ? (
              <>
                <span className="text-sm text-gray-400">
                  <span className="text-orange-400 font-semibold">{user.bunnies.toLocaleString()}</span>{" "}
                  🐰 bunnies
                </span>
                <Link
                  href="/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Create Market
                </Link>
                <Link href="/profile" className="text-sm text-gray-300 hover:text-white transition">
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
