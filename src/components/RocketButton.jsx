// src/components/RocketButton.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';


const RocketSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="##915EFF"/>
          <stop offset="100%" stopColor="#915EFF"/>
        </linearGradient>
        <linearGradient id="rocketWindow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a2e0ff"/>
          <stop offset="100%" stopColor="#050816"/>
        </linearGradient>
      </defs>
      <path fill="url(#rocketBody)" d="M12 2.5s-4 2.5-4 8.5v9l4 2 4-2v-9c0-6-4-8.5-4-8.5z"/>
      <path fill="#FFFFFF" d="M8 11v2h8v-2z"/>
      <circle fill="url(#rocketWindow)" cx="12" cy="9" r="2"/>
      <path fill="#151030" d="M12 2.5c0 0-2 1.5-3 4.5 0 0 1.5-1 3-1s3 1 3 1c-1-3-3-4.5-3-4.5z"/>
      <path fill="#FFFFFF" d="M9 20l-1 4h2l1-4h-2zm6 0l1 4h-2l-1-4h2z"/>
    </svg>
  );

const RocketButton = () => {
  const [isLaunched, setIsLaunched] = useState(false);

  const handleLaunch = () => {
    if (!isLaunched) {     
      setIsLaunched(true);         
      setTimeout(() => setIsLaunched(false), 500);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <motion.button
        onClick={handleLaunch}
        className="relative flex items-center justify-center p-4 focus:outline-none"
        initial={{ y: 0 }}
        animate={{ y: isLaunched ? -300 : 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="w-20" >

        <RocketSVG />
        <span className={`inset-0 flex items-center justify-center text-white font-bold transition-opacity duration-300 ${isLaunched ? 'opacity-0' : 'opacity-100'}`}>
              Launch
            </span>
        </div>
        {isLaunched && (
          <>
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-16 bg-gradient-to-t from-yellow-500 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, height: 48 }}
              transition={{ duration: 0.2, repeat: Infinity, repeatType: 'loop' }}
            />
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [1, 0], scale: [0, 1] }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.1, 
                  repeat: Infinity, 
                  repeatType: 'loop' 
                }}
                style={{ 
                  top: 64, 
                  left: `calc(50% + ${Math.random() * 20 - 10}px)`, 
                  width: `${Math.random() * 4 + 2}px`, 
                  height: `${Math.random() * 4 + 2}px`, 
                  backgroundColor: `rgba(255, 255, 255, ${Math.random()})` 
                }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-yellow-400 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [1, 0], scale: [0, 1.5] }}
                transition={{ 
                  duration: 0.3, 
                  delay: i * 0.2, 
                  repeat: Infinity, 
                  repeatType: 'loop' 
                }}
                style={{ 
                  top: 64, 
                  left: `calc(50% + ${Math.random() * 20 - 10}px)`, 
                  width: `${Math.random() * 4 + 4}px`, 
                  height: `${Math.random() * 4 + 4}px` 
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
};

export default RocketButton;
