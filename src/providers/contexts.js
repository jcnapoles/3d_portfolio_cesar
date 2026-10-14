import { createContext } from "react";
import { getBootState } from "@/lib/device";

const boot = getBootState();

/** Default value mirrors the boot attributes so hooks work even outside the provider. */
export const MotionPreferenceContext = createContext({
  reduced: boot.motion === "reduced",
  osReduced: false,
  userPref: null,
  tier: boot.tier,
  tierBase: boot.tierBase,
  fine: boot.pointer === "fine",
  firstVisit: boot.visit === "first",
  setUserReduced: () => {},
});

/** The Lenis instance, or null when smooth scroll is off (reduced motion, tier C). */
export const LenisContext = createContext(null);

/** The active chapter ({ index, name, id, label } from CHAPTERS). */
export const ChapterContext = createContext({ index: "00", name: "LAUNCH", id: "top", label: "Launch" });
