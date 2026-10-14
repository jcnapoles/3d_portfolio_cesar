import { LazyMotion, domAnimation } from "motion/react";
import MotionPreferenceProvider from "@/providers/MotionPreferenceProvider";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import ChapterProvider from "@/providers/ChapterProvider";

export default function AppProviders({ children }) {
  return (
    <MotionPreferenceProvider>
      <LazyMotion features={domAnimation} strict>
        <SmoothScrollProvider>
          <ChapterProvider>{children}</ChapterProvider>
        </SmoothScrollProvider>
      </LazyMotion>
    </MotionPreferenceProvider>
  );
}
