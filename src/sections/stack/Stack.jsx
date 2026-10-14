import { useRef } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import useBrandIcons from "@/hooks/useBrandIcons";
import { ALSO_IN_THE_LOG } from "@/constants/stack";
import SkyChart from "./SkyChart";
import StackLegend from "./StackLegend";
import "./stack.css";

/**
 * 08 SYSTEMS (spec 6.12): desktop sky chart (decorative) + the accessible legend at every size.
 * The brand glyphs arrive from a lazy chunk once the section is about one viewport away (useBrandIcons);
 * all names and groups are plain text in the entry chunk, and the icon slots are reserved.
 */
export default function Stack() {
  const sectionRef = useRef(null);
  const icons = useBrandIcons(sectionRef);
  return (
    <Section ref={sectionRef} id="stack" chapter="08" labelledBy="stack-title">
      <SectionHeading
        index="08"
        name="SYSTEMS"
        eyebrow="Stack"
        title="Tools I trust in production"
        lead="Chosen for your problem, not my preferences."
        id="stack-title"
      />
      <SkyChart className="hidden lg:block" icons={icons} />
      <StackLegend className="lg:mt-14" icons={icons} />
      <Reveal as="p" className="mt-12 border-t border-line pt-6 text-small text-ink-3">
        {ALSO_IN_THE_LOG}
      </Reveal>
    </Section>
  );
}
