import { m as motion } from "motion/react";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";
import { useLegacyReduced } from "../motionPref";

const StarWrapper = (Component, idName) =>
  function HOC() {
    const reduced = useLegacyReduced();
    return (
      <motion.section
        variants={staggerContainer()}
        initial={reduced ? false : "hidden"}
        whileInView='show'
        viewport={{ once: true, amount: 0.25 }}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };

export default StarWrapper;
