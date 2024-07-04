import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Carousel from '@itseasy21/react-elastic-carousel';
import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { FiEye } from 'react-icons/fi';

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  link,
  source_code_link,
}) => {
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full'
      >
        <div className='relative w-full h-[230px]'>
          <img
            src={image}
            alt='project_image'
            className='w-full h-full object-cover rounded-2xl'
          />

        <div className='absolute inset-0 flex justify-end m-3 space-x-3 card-img_hover'>
        <div
            onClick={() => window.open(link, "_blank")}
            className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer transform transition duration-500 ease-in-out hover:scale-110'
            title='Open preview'
          >
            <FiEye className='w-1/2 h-1/2' />
          </div>
          {source_code_link && (
            <div
              onClick={() => window.open(source_code_link, "_blank")}
              className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer transform transition duration-500 ease-in-out hover:scale-110'
              title='Open source code'
            >
              <img
                src={github}
                alt='source code'
                className='w-1/2 h-1/2 object-contain'
              />
            </div>
          )}
         
        </div>
        </div>

        <div className='mt-5'>
          <h3 className='text-white font-bold text-[24px]'>{name}</h3>
          <p className='mt-2 text-secondary text-[14px]'>{description}</p>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <p
              key={`${name}-${tag.name}`}
              className={`text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const Works = () => {


  const webDevProjects = projects.filter((project) => project.category === "web_development");

  const breakPoints = [
    { width: 1, itemsToShow: 1, itemsToScroll: 1 },
    { width: 720, itemsToShow: 2, itemsToScroll: 1 },
    { width: 1080, itemsToShow: 3, itemsToScroll: 1 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const totalItems = projects.length;
    const interval = setInterval(() => {
      if (currentSlide === totalItems - 1) {
        setCurrentSlide(0);
        carouselRef.current.goTo(0);
      } else {
        setCurrentSlide((prevSlide) => prevSlide + 1);
        carouselRef.current.goTo(currentSlide + 1);
      }
    }, 5000); // Adjust the duration between slides as needed (12 seconds in this example)

    return () => {
      clearInterval(interval);
    };
  }, [currentSlide]);
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} `}>My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      <div className='w-full flex'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'
        >
          Following projects showcases my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos in it. It reflects my
          ability to solve complex problems, work with different technologies,
          and manage projects effectively.
        </motion.p>
      </div>
      <div className='mt-10'>
        <Carousel
          ref={carouselRef}
          isRTL={false}
          pagination={true}
          transitionMs={8000} // Animation speed
          easing={"ease"} // transition easing pattern
          tiltEasing={"ease"} // transition easing pattern for the tilt
          enableTilt={false} // The “bump” animation when reaching the last item        
          itemsToScroll={1} // Number of items to scroll
          breakPoints={breakPoints} // Collection of objects with a width, itemsToShow and itemsToScroll
          initialActiveIndex={currentSlide} // The initial active index when the component mounts
          showArrows={false} // Show the arrow buttons
          focusOnSelect={true} // Go to item on click
          itemPadding={[0, 1]} // A padding for each element
          enableAutoPlay={false} // Enable or disable auto play
          autoPlaySpeed={currentSlide === webDevProjects.length - 1 ? 3000 : 8000}
        >
          
          {projects.map((project, index) => (
            <ProjectCard key={`project-${index}`} index={index} {...project} />
          ))}
      
        </Carousel> 
      </div>
      
      
    </>
  );
};

export default SectionWrapper(Works, "projects");
