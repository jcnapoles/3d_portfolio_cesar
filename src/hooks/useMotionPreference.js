import { useContext } from "react";
import { MotionPreferenceContext } from "@/providers/contexts";

/** { reduced, osReduced, userPref, tier, tierBase, fine, firstVisit, setUserReduced(bool) } */
export default function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}
