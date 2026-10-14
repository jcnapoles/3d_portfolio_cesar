import useMediaQuery from "@/hooks/useMediaQuery";

/** true on devices with a fine, hovering pointer: (hover: hover) and (pointer: fine). */
export default function usePrefersFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
