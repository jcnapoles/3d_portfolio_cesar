import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { styles } from "../styles";
import Badge from "./Badge";
import RocketButton from "./RocketButton";


const Hero = () => {
  return (
    <section className={`relative w-full h-screen items-center`}>
      <div
        className={`absolute inset-0 max-w-7xl mx-auto ${styles.paddingX} flex flex-row justify-center items-center gap-5`}
      >
        <div className='flex flex-col justify-center items-center'>
          <div className='w-5 h-5 rounded-full bg-[#915EFF]' />
          <div className='w-1 h-80 violet-gradient' />
        </div>
        <Tilt  options={{ max: 25, scale: 1.05 }}>
        <div className="flex flex-col justify-center items-center mt-5">
        <div>
            <h1 className={`${styles.heroHeadText} text-white`}>
              Hi, I'm <span className='text-[#915EFF]'>Cesar</span>
            </h1>
            <p className={`${styles.heroSubText} mt-2 text-white-100`}>
              Fractional CTO empowering startups <br className='sm:block hidden' />
              with scalable, user-focused tech leadership
            </p>   
           
          </div>
          <div className="mb-28" >
            <img width="200" height="200" src='/PerfilProColor.jpeg' alt='Cesar Napoles' className='mt-5 order-1 object-cover  p-1 md:order-2 rotate-3 lg:p-2 lg:w-44 aspect-square rounded-2xl bg-black/20 dark:bg-yellow-500/5 ring-1 ring-black/70 dark:ring-white/20 ' style={{borderRadius: "50%"}} />
            <a
              href="/#contact"      
              className="mt-10 ml-5 hover:bg-gray-200 transition-colors duration-200"
              title="Contact me"
            >          
              <Badge>Available to work! 🔗</Badge>
            </a>
          </div>           
       </div> 
        </Tilt>
         
      </div>
      
   

      <div className='absolute xs:bottom-5 bottom-24 w-full flex justify-center items-center'>
       
          <div className='flex justify-center items-start p-2 mb-7 sm:mb-10'>
          <motion.div
              animate={{
                y: [0, 30, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className='w-1 h-5 rounded-full mb-6 sm:mb-28'
            >
               <a href='#about'>
              <RocketButton />
              </a>
            </motion.div>
            
          </div>
        
      </div>
    </section>
  );
};

export default Hero;
