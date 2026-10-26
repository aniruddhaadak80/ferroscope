"use client";

import type { ExposureProfile } from "@ferroscope/core";
import { DEFAULT_PROFILE } from "@ferroscope/seed";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "ferroscope.profile.v1";

interface ProfileStore {
  profile: ExposureProfile;
  completed: readonly string[];
  hydrated: boolean;
  setStack: (stack: readonly string[]) => void;
  toggleStack: (id: string) => void;
  setRegion: (region: string) => void;
  setFlag: (key: "bank" | "passwordManager" | "twoFactor" | "autoUpdates", value: boolean) => void;
  toggleCompleted: (actionId: string) => void;
  resetCompleted: () => void;
  loadProfile: (profile: ExposureProfile) => void;
  reset: () => void;
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      completed: [],
      hydrated: false,
      setStack: (stack) =>
        set((state) => ({ profile: { ...state.profile, stack: [...new Set(stack)] } })),
      toggleStack: (id) =>
        set((state) => {
          const has = state.profile.stack.includes(id);
          return {
            profile: {
              ...state.profile,
              stack: has
                ? state.profile.stack.filter((item) => item !== id)
                : [...state.profile.stack, id],
            },
          };
        }),
      setRegion: (region) => set((state) => ({ profile: { ...state.profile, region } })),
      setFlag: (key, value) => set((state) => ({ profile: { ...state.profile, [key]: value } })),
      toggleCompleted: (actionId) =>
        set((state) => ({
          completed: state.completed.includes(actionId)
            ? state.completed.filter((item) => item !== actionId)
            : [...state.completed, actionId],
        })),
      resetCompleted: () => set({ completed: [] }),
      loadProfile: (profile) => set({ profile, completed: [] }),
      reset: () => set({ profile: DEFAULT_PROFILE, completed: [] }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ profile: state.profile, completed: state.completed }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/**
 * True once the component has mounted on the client. `persist` rehydrates
 * synchronously from localStorage at store creation, so after mount the store
 * already holds the stored profile; before mount we deliberately render the
 * empty/default model so the server and client agree.
 */
export function useProfileHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
