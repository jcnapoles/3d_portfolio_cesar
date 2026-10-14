import { useContext } from "react";
import { LenisContext } from "@/providers/contexts";

/** The Lenis instance from SmoothScrollProvider, or null (reduced motion, tier C, or not created yet). */
export default function useLenis() {
  return useContext(LenisContext);
}
