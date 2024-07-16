import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import "./ButtonStyles.css";

const AnimatedButton = ({ href, download, children }) => {
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  };

  const handleButtonClick = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add("ripple");

    const rippleContainer = button.getElementsByClassName("ripple-container")[0];
    if (rippleContainer) {
      rippleContainer.appendChild(ripple);
    }

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  };

  return (
    <Tilt options={{ max: 25, scale: 1.05 }}>
      <motion.a
        href={href}
        download={download}
        className='bg-[#915EFF] text-white px-4 py-2 rounded text-[18px] font-medium cursor-pointer ripple-container'
        whileHover={{
          scale: [1, 1.2, 1.1],
          rotate: [0, 15, -15, 0],
          backgroundColor: "#FF6F61",
          boxShadow: "0 0 20px rgba(255, 111, 97, 0.7)",
          x: [0, 10, -10, 0],
          y: [0, -10, 10, 0],
          opacity: [1, 0.8, 1],
          transition: {
            duration: 0.6,
            ease: "easeInOut"
          }
        }}
        whileTap={{
          scale: 0.8,
          backgroundColor: "#FF3E41",
          boxShadow: "0 0 20px rgba(255, 62, 65, 0.7)",
          x: 0,
          y: 0,
          transition: {
            duration: 0.2,
            ease: "easeInOut"
          }
        }}
        animate={floatingAnimation}
        onClick={handleButtonClick}
      >
        {children}
      </motion.a>
    </Tilt>
  );
};

export default AnimatedButton;
