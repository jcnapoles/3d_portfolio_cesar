import { useContext } from "react";
import { ChapterContext } from "@/providers/contexts";

/** The active chapter { index, name, id, label } (default chapter "00"). */
export default function useActiveChapter() {
  return useContext(ChapterContext);
}
