import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import "react-vertical-timeline-component/style.min.css";

import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";

const ExperienceCard = ({ experience }) => {
  return (    
    <VerticalTimelineElement
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
      }}
      contentArrowStyle={{ borderRight: "15px solid  #232631" }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      icon={
        <div className='flex justify-center items-center w-full h-full'>
          <img
            src={experience.icon}
            alt={experience.company_name}
            className='w-[90%] h-[90%] object-contain'
          />
        </div>
      }
    >
      
      <div>
        <h3 className='text-white text-[24px] font-bold'>{experience.title}</h3>
        <p
          className='text-secondary text-[16px] font-semibold'
          style={{ margin: 0 }}
        >
          {experience.company_name}
        </p>
      </div>

      <ul className='mt-5 list-disc ml-5 space-y-2'>
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className='text-white-100 text-[14px] pl-1 tracking-wider'
          >
            {point}
          </li>
        ))}
      </ul>
      
    </VerticalTimelineElement>    
  );
};

const MobileExperienceCard = ({ experience }) => {
  return (
    <div
      className='flex-shrink-0 w-[85vw] snap-center rounded-2xl p-5'
      style={{ background: "#1d1836" }}
    >
      <div className='flex items-center gap-3 mb-4'>
        <div
          className='w-12 h-12 rounded-full flex justify-center items-center flex-shrink-0'
          style={{ background: experience.iconBg }}
        >
          <img
            src={experience.icon}
            alt={experience.company_name}
            className='w-[80%] h-[80%] object-contain'
          />
        </div>
        <div>
          <h3 className='text-white text-[18px] font-bold leading-tight'>{experience.title}</h3>
          <p className='text-secondary text-[14px] font-semibold'>{experience.company_name}</p>
        </div>
      </div>

      <p className='text-secondary text-[13px] mb-3'>{experience.date}</p>

      <ul className='list-disc ml-5 space-y-2'>
        {experience.points.map((point, index) => (
          <li
            key={`experience-mobile-point-${index}`}
            className='text-white-100 text-[13px] pl-1 tracking-wider'
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Experience = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const barRef = useRef(null);
  const cardsRef = useRef(null);
  const isScrollingFromTap = useRef(false);

  // Sync logo bar highlight when active index changes
  useEffect(() => {
    if (!barRef.current) return;
    const btn = barRef.current.children[activeIndex];
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeIndex]);

  // Detect which card is in view when user swipes the cards
  const handleCardsScroll = useCallback(() => {
    if (isScrollingFromTap.current) return;
    const container = cardsRef.current;
    if (!container) return;

    const cards = container.children;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    setActiveIndex(closestIdx);
  }, []);

  // Scroll cards to a specific index when tapping a logo
  const scrollToCard = useCallback((index) => {
    const container = cardsRef.current;
    if (!container || !container.children[index]) return;

    isScrollingFromTap.current = true;
    setActiveIndex(index);

    const card = container.children[index];
    const scrollLeft = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });

    // Reset the flag after scroll settles
    setTimeout(() => {
      isScrollingFromTap.current = false;
    }, 400);
  }, []);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>
          What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText}`}>
          Work Experience.
        </h2>
      </motion.div>

      {/* Desktop: vertical timeline */}
      <div className='mt-20 hidden md:flex flex-col'>
        <VerticalTimeline>        
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              experience={experience}
            />            
          ))}
        </VerticalTimeline>
      </div>

      {/* Mobile: horizontal logo bar + swipeable cards */}
      <div className='mt-10 md:hidden'>
        {/* Horizontal logo bar */}
        <div className='flex items-center px-2 mb-6'>
          <div
            ref={barRef}
            className='experience-scroll-hidden relative z-10 flex items-center gap-3 overflow-x-auto w-full py-2 px-1'
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {experiences.map((experience, index) => (
              <button
                key={`exp-icon-${index}`}
                onClick={() => scrollToCard(index)}
                className={`flex-shrink-0 w-11 h-11 rounded-full flex justify-center items-center transition-all duration-200
                  ${activeIndex === index
                    ? "ring-2 ring-[#915eff] scale-110 shadow-lg shadow-[#915eff]/30"
                    : "opacity-60 hover:opacity-90"
                  }`}
                style={{ background: experience.iconBg }}
              >
                <img
                  src={experience.icon}
                  alt={experience.company_name}
                  className='w-[75%] h-[75%] object-contain'
                />
              </button>
            ))}
          </div>
        </div>

        {/* Swipeable cards */}
        <div
          ref={cardsRef}
          className='experience-scroll flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-2'
          style={{ WebkitOverflowScrolling: "touch" }}
          onScroll={handleCardsScroll}
        >
          {experiences.map((experience, index) => (
            <MobileExperienceCard
              key={`experience-mobile-${index}`}
              experience={experience}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "experience");
