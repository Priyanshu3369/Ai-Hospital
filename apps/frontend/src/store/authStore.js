import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  setAuth: (authData) => set(authData),
}));
