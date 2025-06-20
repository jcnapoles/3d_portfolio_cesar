import React from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const personalImageAlt = "Cesar Napoles"

const ServiceCard = ({ index, title, icon }) => (
  <Tilt className='xs:w-[250px] w-full'>
    <motion.div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card'
    >
      <div
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
      >
        <img
          src={icon}
          alt='web-development'
          className='w-16 h-16 object-contain'
        />

        <h3 className='text-white text-[20px] font-bold text-center'>
          {title}
        </h3>
      </div>
    </motion.div>
  </Tilt>
);

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
        I’m a strategic and hands-on tech leader with deep experience in Java, JavaScript, 
        and modern frameworks like Spring, Angular, and React. As a Fractional CTO, I help startups build scalable, 
        user-centric products, align tech with business goals, and accelerate their growth. 
        I thrive in fast-paced environments, working closely with founders to turn ideas 
        into reliable, real-world solutions.        
      </motion.p> 
      </div>
                
      <div className='mt-5 flex flex-wrap gap-10'>
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
