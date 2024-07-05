import React, { useRef, useState } from "react";
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import { FaLinkedin, FaSkype, FaGithub } from 'react-icons/fa';

const Contact = () => {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => { 
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setNotification({ message: 'Please fill in all fields.', type: 'error' });
      return;
    }
     
    const confettiConfig = {
      angle: 45, // Ángulo en el que se disparará el confetti
      spread: 5000, // Qué tan lejos se esparcirá el confetti
      startVelocity: 50, // Qué tan rápido saldrá el confetti
      elementCount: 70, // Cantidad de piezas de confetti
      dragFriction: 0.4, // Fricción que ralentiza el movimiento del confetti
      duration: 10000, // Cuánto tiempo (en milisegundos) estará el confetti en el aire
      stagger: 4, // Retraso entre cada pieza de confetti
      width: "100px", // Ancho de cada pieza de confetti
      height: "100px", // Altura de cada pieza de confetti
      colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'], // Colores del confetti
    };
    setLoading(true);
    let message = `
      Name: ${form.name}
      Email: ${form.email}
      Message: ${form.message}
    `;
    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Cesar",
          from_email: form.email,
          to_email: import.meta.env.VITE_APP_EMAIL_FROM,
          message: message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          setNotification({ message: "Thank you. I will get back to you as soon as possible.", type: 'success' });
          confetti(confettiConfig);
          setForm({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setLoading(false);
          console.error(error);

          setNotification({message: "Ahh, something went wrong. Please try again.", type: 'error' } );
        }
      );
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.75] bg-transparent-100 p-8 rounded-2xl'
      >
        <p className={styles.sectionSubText}>Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>
        <div className="mt-5 flex gap-4 justify-center">
          <a
            href="https://linkedin.com/in/jcnapoles"
            target="_blank"
            rel="noopener"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaLinkedin className="mr-2 text-2xl" />     
          </a>
          <a
            href="skype:live:juliocesarnapolespuente?chat"
            target="_blank"
            rel="noopener"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaSkype className="mr-2 text-2xl" />
          </a>
          <a
            href="https://github.com/jcnapoles"
            target="_blank"
            rel="noopener"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaGithub className="mr-2 text-2xl" />
          </a>
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='mt-12 flex flex-col gap-8'
        >
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>Your Name</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder="What's your good name?"
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>Your email</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder="What's your email address?"
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-4'>Your Message</span>
            <textarea
              rows={4}
              name='message'
              value={form.message}
              onChange={handleChange}
              placeholder='What you want to say?'
              className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>          
         
          {notification.message && (
            <div className={`text-white py-2 px-4 rounded-md mb-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {notification.message}
              <button onClick={closeNotification} className='float-right'>
                &times;
              </button>
            </div>
          )}
          <button
            type='submit'
            className='bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary hover:bg-[#915EFF] transition'
          >
            {loading ? "Sending..." : "Send"}
          </button>          
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
