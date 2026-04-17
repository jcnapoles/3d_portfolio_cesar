import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const personalImageAlt = "Cesar Napoles"

const ServiceCard = ({ index, title, icon }) => {
  const [expanded, setExpanded] = useState(false);
  const leaveTimer = useRef(null);

  const handleEnter = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setExpanded(true);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setExpanded(false), 150);
  }, []);

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="service-sphere-wrapper"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className={`service-sphere-container ${expanded ? 'is-expanded' : ''}`}>
        {/* Sphere face */}
        <div className="service-sphere-face">
          <img src={icon} alt={title} className="service-sphere-icon" />
          <span className="service-sphere-label">{title}</span>
        </div>

        {/* Card face (with Tilt) */}
        <div className="service-card-face">
          <Tilt
            tiltMaxAngleX={45}
            tiltMaxAngleY={45}
            scale={1}
            transitionSpeed={450}
            style={{ width: '100%', height: '100%' }}
          >
            <div className='green-pink-gradient p-[1px] rounded-[20px] shadow-card w-full h-full'>
              <div className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col w-full h-full'>
                <img
                  src={icon}
                  alt={title}
                  className='w-16 h-16 object-contain'
                />
                <h3 className='text-white text-[20px] font-bold text-center'>
                  {title}
                </h3>
              </div>
            </div>
          </Tilt>
        </div>
      </div>
    </motion.div>
  );
};

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      
      <div className='flex items-center'> 
      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className='mt-10 text-secondary text-[19px] max-w-3x1 leading-[35px]'
      >
        <img 
      width="200" 
      height="200" 
      src="/cesar_desktop.webp" 
      alt={personalImageAlt} 
      className="float-right mt-auto ml-auto mr-auto order-1 object-cover w-64 h-full p-1 md:order-2 rotate-3 lg:p-2 lg:w-64 aspect-square rounded-2xl bg-black/20 dark:bg-yellow-500/5 ring-1 ring-black/70 dark:ring-white/20 "  
    /> 
        I'm a hands-on tech leader and founder with 12+ years of experience shipping production 
        software at scale. I've driven digital transformation in insurance (FIATC Seguros), 
        scaled platforms to 250K+ users (Sttok), and currently build banking systems at 
        CaixaBank Tech while running Closevibe — my AI-powered SaaS startup. As a Fractional CTO, 
        I help companies go from idea to scalable product, aligning technology with business outcomes 
        and building teams that deliver.
      </motion.p> 
      </div>
                
      <div className='mt-5 flex flex-wrap gap-10 justify-center items-center'>
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
