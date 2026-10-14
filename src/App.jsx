import AppProviders from "@/providers/AppProviders";
import VersionProvider from "@/providers/VersionProvider";
import SpaceBackground from "@/components/background/SpaceBackground";
import SkipLink from "@/components/ui/SkipLink";
import GsapBoot from "@/components/system/GsapBoot";
import DeferredMount from "@/components/system/DeferredMount";
import CursorBrackets from "@/components/system/CursorBrackets";
import { VersionPill } from "@/components/system/VersionSwitch";
import Navbar from "@/sections/chrome/Navbar";
import MissionRail from "@/sections/chrome/MissionRail";
import MobileStickyCta from "@/sections/chrome/MobileStickyCta";
import LiveDemoChip from "@/sections/chrome/LiveDemoChip";
import Hero from "@/sections/hero/Hero";
import Telemetry from "@/sections/telemetry/Telemetry";
import Fit from "@/sections/fit/Fit";
import Services from "@/sections/services/Services";
import Missions from "@/sections/missions/Missions";
import KineticStrip from "@/sections/kinetic-strip/KineticStrip";
import Process from "@/sections/process/Process";
import Testimonials from "@/sections/testimonials/Testimonials";
import About from "@/sections/about/About";
import Builds from "@/sections/builds/Builds";
import Stack from "@/sections/stack/Stack";
import Faq from "@/sections/faq/Faq";
import Contact from "@/sections/contact/Contact";
import Footer from "@/sections/footer/Footer";

/**
 * The 2026 site ("Mission Control") with all of its providers. VersionProvider unmounts it entirely while the
 * 2024 site is shown (Lenis, chapters, GSAP and the Galaxy tear down) and mounts it fresh on the way back.
 */
function NewSite() {
  return (
    <AppProviders>
      <SkipLink />
      <SpaceBackground />
      <Navbar />
      <main id="main" className="relative z-content">
        <Hero />
        {/* Below the fold: mounted group by group right after the hero's first frame (DeferredMount). */}
        <DeferredMount step={1}>
          <Telemetry />
        </DeferredMount>
        <DeferredMount step={2}>
          <Fit />
          <Services />
        </DeferredMount>
        <DeferredMount step={3}>
          <Missions />
        </DeferredMount>
        <DeferredMount step={4}>
          <KineticStrip />
          <Process />
          <Testimonials />
        </DeferredMount>
        <DeferredMount step={5}>
          <About />
          <Builds />
        </DeferredMount>
        <DeferredMount step={6}>
          <Stack />
          <Faq />
          <Contact />
        </DeferredMount>
      </main>
      <DeferredMount step={6}>
        <Footer />
      </DeferredMount>
      <MissionRail />
      <MobileStickyCta />
      <LiveDemoChip />
      <VersionPill />
      <CursorBrackets />
      <GsapBoot />
    </AppProviders>
  );
}

/** Root: the 2026 site by default; the 2024 site (lazy chunk, src/legacy) on request. */
export default function App() {
  return <VersionProvider NewSite={NewSite} />;
}
