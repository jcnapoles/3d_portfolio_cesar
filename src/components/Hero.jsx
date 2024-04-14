import { motion } from "framer-motion";

import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";
import Badge from "./Badge";

const Hero = () => {
  return (
    <section className={`relative w-full h-screen items-center`}>
      <div
        className={`absolute inset-0 max-w-7xl mx-auto ${styles.paddingX} flex flex-row justify-center items-center gap-5`}
      >
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-5 h-5 rounded-full bg-[#915EFF]' />
          <div className='w-1 sm:h-80 h-40 violet-gradient' />
        </div>

       <div className="flex flex-col justify-center items-center mt-5">
        <div>
            <h1 className={`${styles.heroHeadText} text-white`}>
              Hi, I'm <span className='text-[#915EFF]'>Cesar</span>
            </h1>
            <p className={`${styles.heroSubText} mt-2 text-white-100`}>
              I develop web applications, user <br className='sm:block hidden' />
              interfaces and APIs.
            </p>   
           
          </div>
          <div className="" >
            <img width="200" height="200" src='/cesar.webp' alt='Cesar Napoles' className='mt-5 order-1 object-cover  p-1 md:order-2 rotate-3 lg:p-2 lg:w-44 aspect-square rounded-2xl bg-black/20 dark:bg-yellow-500/5 ring-1 ring-black/70 dark:ring-white/20 ' style={{borderRadius: "50%"}} />
            <a
              href="/#contact"      
              className="mt-10 ml-5 hover:bg-gray-200 transition-colors duration-200"
              title="Contact me"
            >          
              <Badge>Available to work! 🔗</Badge>
            </a>
          </div>           
       </div>   
      </div>
      
   

      <div className='absolute xs:bottom-5 bottom-24 w-full flex justify-center items-center'>
        <a href='#about'>
          <div className='w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className='w-3 h-3 rounded-full bg-secondary mb-1'
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
