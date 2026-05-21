import { create } from "zustand";
import { persist } from "zustand/middleware";

const ROLE_DEFAULT_ROUTES = {
  manager: "/dashboard",
  cra: "/drives",
  admin: "/analytics",
  medical: "/scanner",
};

const ROLE_LABELS = {
  manager: "Hospital Blood Bank Manager",
  cra: "CRA Association",
  admin: "National Health Administrator",
  medical: "Medical Team",
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      lastActivity: Date.now(),

      login: (user, token) => {
        set({ user, token, lastActivity: Date.now() });
      },

      logout: () => set({ user: null, token: null }),

      touch: () => set({ lastActivity: Date.now() }),

      isSessionValid: () => {
        const { user, lastActivity } = get();
        if (!user) return false;
        const thirtyMin = 30 * 60 * 1000;
        return Date.now() - lastActivity < thirtyMin;
      },

      getDefaultRoute: () => {
        const role = get().user?.role;
        return ROLE_DEFAULT_ROUTES[role] || "/dashboard";
      },
    }),
    { name: "bloodsync-auth" }
  )
);

export { ROLE_LABELS, ROLE_DEFAULT_ROUTES };
