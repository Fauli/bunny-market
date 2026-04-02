"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { id: string; username: string; bunnies: number } | null;

const UserContext = createContext<{
  user: User;
  setUser: (u: User) => void;
  refresh: () => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  refresh: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const refresh = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
