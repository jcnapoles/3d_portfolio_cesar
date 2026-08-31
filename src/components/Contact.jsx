import React, { useEffect, useRef, useState } from "react";
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import { FaLinkedin, FaGithub, FaRegCalendarAlt } from 'react-icons/fa';
import { HONEYPOT_FIELD, TURNSTILE_TOKEN_FIELD } from '../../netlify/shared/form-fields.js';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise = null;

/** Loads the Turnstile API once, however many times a component asks for it. */
const loadTurnstileScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error('Failed to load Turnstile'));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

const Contact = () => {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    [HONEYPOT_FIELD]: "",
  });

  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    type: '',
    linkText: '',
    linkHref: '',
  });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;

    let widgetId = null;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileRef.current || !window.turnstile) return;

        widgetId = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          // Stay out of the visitor's way unless Cloudflare actually wants them
          // to do something.
          appearance: 'interaction-only',
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        });

        turnstileWidgetId.current = widgetId;
      })
      .catch(() => {
        // Nothing to do here: submitting without a token surfaces the error.
      });

    // StrictMode mounts effects twice in development, so tear the widget down.
    return () => {
      cancelled = true;
      if (widgetId !== null && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      turnstileWidgetId.current = null;
    };
  }, []);

  /** Turnstile tokens are single use, so each attempt needs a fresh one. */
  const resetTurnstile = () => {
    setTurnstileToken('');
    if (turnstileWidgetId.current !== null && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  };

  const buildMailtoLink = () => {
    const toEmail = import.meta.env.VITE_APP_EMAIL_FROM || '';
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || 'visitor'}`);
    const body = encodeURIComponent(
      `Name: ${form.name || ''}\nEmail: ${form.email || ''}\n\nMessage:\n${form.message || ''}`
    );

    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  const getResendErrorMessage = (error) => {
    const details = `${error?.message || ''} ${error?.error || ''}`.toLowerCase();

    if (error?.status === 429) {
      return 'You have already sent a few messages. Please wait a little while before trying again.';
    }

    if (error?.code === 'failed_verification') {
      return 'We could not verify your submission. Please try sending it again.';
    }

    if (error?.status === 403) {
      return 'This submission was blocked. Please send your message from your email app instead.';
    }

    if (details.includes('missing environment variables')) {
      return 'Contact form is not configured yet. Please try again later or use the email app button.';
    }

    if (error?.status >= 500) {
      return 'Email service is temporarily unavailable. You can send the message directly from your email app.';
    }

    return 'Ahh, something went wrong. Please try again.';
  };

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setNotification({ message: 'Please fill in all fields.', type: 'error', linkText: '', linkHref: '' });
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setNotification({
        message: 'Still checking you are human. Please try again in a moment.',
        type: 'error',
        linkText: '',
        linkHref: '',
      });
      return;
    }

    const confettiConfig = {
      angle: 45,
      spread: 5000,
      startVelocity: 50,
      elementCount: 70,
      dragFriction: 0.4,
      duration: 10000,
      stagger: 4,
      width: "100px",
      height: "100px",
      colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
    };

    setLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          [HONEYPOT_FIELD]: form[HONEYPOT_FIELD],
          [TURNSTILE_TOKEN_FIELD]: turnstileToken,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw { status: response.status, ...result };
      }

      setNotification({
        message: 'Thank you. I will get back to you as soon as possible.',
        type: 'success',
        linkText: '',
        linkHref: '',
      });
      confetti(confettiConfig);
      setForm({
        name: '',
        email: '',
        message: '',
        [HONEYPOT_FIELD]: '',
      });
    } catch (error) {
      console.error(error);
      setNotification({
        message: getResendErrorMessage(error),
        type: 'error',
        linkText: 'Open email app',
        linkHref: buildMailtoLink(),
      });
    } finally {
      setLoading(false);
      resetTurnstile();
    }
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '', linkText: '', linkHref: '' });
  };

  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col gap-6 sm:gap-10 overflow-hidden`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.75] bg-transparent-100 p-4 sm:p-8 rounded-2xl'
      >
        <p className={styles.sectionSubText}>Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>
        <div className="mt-2 sm:mt-5 flex gap-4 justify-center">
          <a
            href="https://linkedin.com/in/jcnapoles"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open LinkedIn profile (opens in a new tab)"
            title="LinkedIn"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaLinkedin className="mr-2 text-2xl" aria-hidden="true" />     
          </a>
          <a
            href="https://calendly.com/cesarnapoles/30min"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Schedule a 30-minute meeting on Calendly (opens in a new tab)"
            title="Book a call on Calendly"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaRegCalendarAlt className="mr-2 text-2xl" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/jcnapoles"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub profile (opens in a new tab)"
            title="GitHub"
            className="flex items-center transition md:justify-center md:hover:scale-105"
          >
            <FaGithub className="mr-2 text-2xl" aria-hidden="true" />
          </a>
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='mt-4 sm:mt-12 flex flex-col gap-4 sm:gap-8'
        >
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2 sm:mb-4'>Your Name</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder="What's your good name?"
              className='bg-tertiary py-3 sm:py-4 px-4 sm:px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2 sm:mb-4'>Your email</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder="What's your email address?"
              className='bg-tertiary py-3 sm:py-4 px-4 sm:px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2 sm:mb-4'>Your Message</span>
            <textarea
              rows={3}
              name='message'
              value={form.message}
              onChange={handleChange}
              placeholder='What you want to say?'
              className='bg-tertiary py-3 sm:py-4 px-4 sm:px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
            />
          </label>          
         
          {/*
            Honeypot. Sits off-screen and out of the tab order, so a real
            visitor never sees it. Bots fill every input they find, and the API
            silently discards any submission that arrives with this field set.
          */}
          <div
            aria-hidden='true'
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
            <input
              type='text'
              id={HONEYPOT_FIELD}
              name={HONEYPOT_FIELD}
              value={form[HONEYPOT_FIELD]}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete='off'
            />
          </div>

          {notification.message && (
            <div className={`text-white py-2 px-4 rounded-md mb-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {notification.message}
              {notification.linkHref && (
                <a
                  href={notification.linkHref}
                  className='underline font-semibold ml-2'
                >
                  {notification.linkText}
                </a>
              )}
              <button type='button' onClick={closeNotification} className='float-right'>
                &times;
              </button>
            </div>
          )}
          {/*
            Turnstile mounts into the div below. With appearance
            'interaction-only' it renders an empty, zero-height element unless
            the visitor genuinely has to solve something.

            It shares a gapless wrapper with the submit button on purpose: as a
            direct child of the form it would claim a full gap slot even while
            invisible, pushing the button down for everyone.
          */}
          <div className='flex flex-col'>
            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}
            <button
              type='submit'
              className='bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary hover:bg-[#915EFF] transition'
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[200px]'
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
