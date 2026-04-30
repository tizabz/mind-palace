import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface AppState {
  count: number;
  theme: Theme;
  user: { name: string } | null;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTheme: (theme: Theme) => void;
  setUser: (user: { name: string } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      count: 0,
      theme: "light",
      user: null,
      increment: () => set((s) => ({ count: s.count + 1 })),
      decrement: () => set((s) => ({ count: s.count - 1 })),
      reset: () => set({ count: 0 }),
      setTheme: (theme) => set({ theme }),
      setUser: (user) => set({ user }),
    }),
    { name: "app-store" }
  )
);
