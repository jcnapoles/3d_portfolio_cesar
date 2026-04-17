import React from "react";

import { TechSphereCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import { motion } from "framer-motion";

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>
          Technologies I work with daily
        </p>
        <h2 className={`${styles.sectionHeadText} mb-10`}>
          Tech Skills.
        </h2>
      </motion.div>

      <TechSphereCanvas technologies={technologies} />
    </>
  );
};

export default SectionWrapper(Tech, "skills");
