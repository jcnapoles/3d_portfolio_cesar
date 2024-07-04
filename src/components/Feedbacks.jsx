import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Carousel from '@itseasy21/react-elastic-carousel';
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { testimonials } from "../constants";
import { FaLinkedin } from 'react-icons/fa';

const FeedbackCard = ({
  index,
  testimonial,
  name,
  designation,
  company,
  linkedin,
  image,
}) => (
  <motion.div
  variants={fadeIn("", "spring", index * 0.5, 0.75)}
  className='bg-black-200 p-10 rounded-3xl xs:w-[320px] w-full flex flex-col justify-center items-center'
>
  <div className='mt-1 flex-grow flex flex-col justify-between'>
    <p className='text-white tracking-wider text-[18px]'>" {testimonial} "</p>
    <div className='mt-7 flex flex-col items-center gap-1'>
      <div className='flex-1 flex flex-col items-center'>
        <p className='text-white font-medium text-[16px]'>
          <span className='blue-text-gradient'>@</span> {name}
        </p>
        <p className='mt-1 text-secondary text-[12px]'>
          {designation} at {company}
        </p>         
      </div>
      <div className='flex items-center gap-2'>
        <img
          src={image}
          alt={`feedback_by-${name}`}
          className='w-10 h-10 rounded-full object-cover'
        />
        <a
          href={linkedin}
          target="_blank"
          rel="noopener"
          className="mt-2"
        >
          <FaLinkedin className="text-[20px]" /> 
        </a>
      </div>
    </div>
  </div>
</motion.div>
);

const Feedbacks = () => {
  const breakPoints = [
    { width: 1, itemsToShow: 1, itemsToScroll: 1 },
    { width: 720, itemsToShow: 2, itemsToScroll: 1 },
    { width: 1080, itemsToShow: 3, itemsToScroll: 1 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const totalItems = testimonials.length;
    const interval = setInterval(() => {
      if (currentSlide === totalItems - 1) {
        setCurrentSlide(0);
        carouselRef.current.goTo(0);
      } else {
        setCurrentSlide((prevSlide) => prevSlide + 1);
        carouselRef.current.goTo(currentSlide + 1);
      }
    }, 5000); // Adjust the duration between slides as needed (8 seconds in this example)

    return () => {
      clearInterval(interval);
    };
  }, [currentSlide]);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-left`}>What others say</p>
        <h2 className={`${styles.sectionHeadText} text-left`}>Testimonials.</h2>
      </motion.div>
      <div className={`mt-12 rounded-[20px]`}>

        <div className={`mt-12 rounded-2xl min-h-[300px]`}>
          <div style={{ height: '20px' }}></div>

          <Carousel
            ref={carouselRef}
            isRTL={false}
            pagination={true}
            transitionMs={2000} // Set the duration for each item transition
            enableAutoPlay={true} // Disable auto play
            enableTilt={false}
            breakPoints={breakPoints}
            showArrows={false}
            focusOnSelect={true}
          
            initialActiveIndex={currentSlide}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name}>
                <FeedbackCard index={index} {...testimonial} />
              </div>
            ))}
          </Carousel>          
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Feedbacks, "");
