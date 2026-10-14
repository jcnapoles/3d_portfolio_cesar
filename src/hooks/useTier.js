import useMotionPreference from "@/hooks/useMotionPreference";

/** 'A' | 'B' | 'C' (C whenever motion is reduced). */
export default function useTier() {
  return useMotionPreference().tier;
}
