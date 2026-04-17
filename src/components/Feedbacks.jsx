import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { testimonials } from "../constants";
import { FaLinkedin, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FeedbackCard = ({
  index,
  testimonial,
  name,
  designation,
  company,
  linkedin,
  image,
  mobile,
}) => (
  <motion.div
    variants={!mobile ? fadeIn("up", "spring", index * 0.5, 0.75) : undefined}
  >
    <Tilt
      options={{
        max: mobile ? 0 : 45,
        scale: 1,
        speed: 450,
      }}
      className={`p-5 rounded-2xl ${mobile ? 'w-full' : 'sm:w-[360px] w-full'}`}
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
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/PerfilProColor.jpeg';
              }}
            />
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-no-drag='true'
              className="mt-2"
            >
              <FaLinkedin className="text-[20px]" />
            </a>
          </div>
        </div>
      </div>
    </Tilt>
  </motion.div>
);

FeedbackCard.propTypes = {
  index: PropTypes.number.isRequired,
  testimonial: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  designation: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  linkedin: PropTypes.string,
  image: PropTypes.string,
  mobile: PropTypes.bool,
};

const MobileCarousel = () => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const total = testimonials.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDeltaX.current > 50) prev();
    else if (touchDeltaX.current < -50) next();
  };

  return (
    <div className="mt-8">
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((t, i) => (
            <div key={`fb-m-${t.name}`} className="w-full flex-shrink-0 px-2">
              <FeedbackCard index={i} {...t} mobile />
            </div>
          ))}
        </div>
      </div>
      {/* Navigation dots + arrows */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={prev} className="text-secondary hover:text-white transition-colors p-2" aria-label="Previous testimonial">
          <FaChevronLeft className="text-[16px]" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-secondary/40'}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={next} className="text-secondary hover:text-white transition-colors p-2" aria-label="Next testimonial">
          <FaChevronRight className="text-[16px]" />
        </button>
      </div>
    </div>
  );
};

const Feedbacks = () => {
  // Detect mobile (<640px = below sm breakpoint)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Marquee-style draggable track (same behavior as Works)
  const firstHalfRef = useRef(null);
  const firstCardRef = useRef(null);
  const [durationSec, setDurationSec] = useState(30);
  const [paused, setPaused] = useState(false);
  const [offsetPx, setOffsetPx] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackInnerRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velRef = useRef(0);
  const inertiaRafRef = useRef(null);
  const dragStartedRef = useRef(false);
  const dragBlockRef = useRef(false);
  const pointerDownRef = useRef(false);
  const DRAG_THRESHOLD = 6; // px

  const isInteractiveTarget = (el) => {
    let node = el;
    while (node && node !== trackInnerRef.current) {
      if (!node) break;
      const tag = (node.tagName || '').toLowerCase();
      if (
        node.dataset?.noDrag === 'true' ||
        tag === 'a' ||
        tag === 'button' ||
        node.getAttribute?.('role') === 'button'
      ) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  };

  useEffect(() => {
    const calc = () => {
      const w = firstHalfRef.current?.scrollWidth || 0;
      if (w > 0) {
        const pxPerSec = 150; // faster than Projects to make Feedbacks scroll a bit quicker
        const dur = Math.max(10, Math.round(w / pxPerSec));
        setDurationSec(dur);
        if (offsetPx === 0) {
          setOffsetPx(-w);
          dragStartOffsetRef.current = -w;
        } else {
          const norm = ((offsetPx % w) + w) % w; // [0, w)
          const wrapped = norm === 0 ? 0 : norm - w; // (-w, 0]
          setOffsetPx(wrapped);
          dragStartOffsetRef.current = wrapped;
        }
      }
      const cardEl = firstCardRef.current;
      if (cardEl) {
        const gapParent = cardEl.parentElement;
        const styles = gapParent ? window.getComputedStyle(gapParent) : null;
        const gapStr = styles?.getPropertyValue('column-gap') || styles?.getPropertyValue('gap') || '8px';
        const gap = parseFloat(gapStr) || 8;
        const step = Math.round(cardEl.getBoundingClientRect().width + gap);
        setStepPx(step);
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const onPointerDown = (e) => {
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    dragBlockRef.current = isInteractiveTarget(e.target);
    setPaused(true);
    setIsDragging(false);
    dragStartedRef.current = false;
    dragStartXRef.current = e.clientX ?? (e.touches ? e.touches[0]?.clientX : 0);
    dragStartOffsetRef.current = offsetPx;
    lastXRef.current = dragStartXRef.current;
    lastTRef.current = performance.now();
    velRef.current = 0;
    pointerDownRef.current = true;
  };

  const onPointerMove = (e) => {
    if (!pointerDownRef.current) return;
    if (dragBlockRef.current) return;
    const x = e.clientX ?? (e.touches ? e.touches[0]?.clientX : 0);
    const now = performance.now();
    const dx = x - dragStartXRef.current;
    if (!dragStartedRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      dragStartedRef.current = true;
      setIsDragging(true);
    }
    const w = firstHalfRef.current?.scrollWidth || 0;
    if (!w) return;
    const next = dragStartOffsetRef.current + dx;
    const norm = ((next % w) + w) % w;
    const wrapped = norm === 0 ? 0 : norm - w;
    setOffsetPx(wrapped);

    const dt = now - lastTRef.current;
    if (dt > 0) {
      const instDx = x - lastXRef.current;
      velRef.current = instDx / dt;
      lastXRef.current = x;
      lastTRef.current = now;
    }
  };

  const endDrag = () => {
    pointerDownRef.current = false;
    if (!dragStartedRef.current || dragBlockRef.current) {
      setPaused(false);
      dragBlockRef.current = false;
      return;
    }
    setIsDragging(false);
    dragStartedRef.current = false;
    dragBlockRef.current = false;
    const v0 = velRef.current;
    const minV = 0.05; // px/ms
    if (Math.abs(v0) > minV) {
      startInertia(v0);
    } else {
      setPaused(false);
    }
  };

  const startInertia = (v0) => {
    setPaused(true);
    if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
    let v = v0;
    let prev = performance.now();
    const k = 0.005;
    const step = (now) => {
      const w = firstHalfRef.current?.scrollWidth || 0;
      if (!w) {
        setPaused(false);
        inertiaRafRef.current = null;
        return;
      }
      const dt = now - prev;
      prev = now;
      const next = offsetPx + v * dt;
      const norm = ((next % w) + w) % w;
      const wrapped = norm === 0 ? 0 : norm - w;
      setOffsetPx(wrapped);
      v = v * Math.exp(-k * dt);
      if (Math.abs(v) < 0.01) {
        inertiaRafRef.current = null;
        setPaused(false);
        return;
      }
      inertiaRafRef.current = requestAnimationFrame(step);
    };
    inertiaRafRef.current = requestAnimationFrame(step);
  };

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-left`}>What others say</p>
        <h2 className={`${styles.sectionHeadText} text-left`}>Testimonials.</h2>
      </motion.div>

      {isMobile ? (
        <MobileCarousel />
      ) : (
      <div className={`mt-12 rounded-[20px]`}>
        <div className={`mt-12 rounded-2xl min-h-[300px]`}>
          <div style={{ height: '20px' }}></div>
          <div
            className={`relative overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div
              className={`will-change-transform animate-marquee ${paused ? 'paused' : ''}`}
              style={{ ['--duration']: `${durationSec}s` }}
              tabIndex={0}
            >
              <div
                ref={trackInnerRef}
                className='flex flex-nowrap gap-2'
                style={{ transform: `translateX(${offsetPx}px)`, touchAction: 'pan-y' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <div className='flex flex-nowrap gap-2' ref={firstHalfRef}>
                  {testimonials.map((testimonial, i) => (
                    <div key={`fb-a-${testimonial.name}`} ref={i === 0 ? firstCardRef : null}>
                      <FeedbackCard index={0} {...testimonial} />
                    </div>
                  ))}
                </div>
                <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                  {testimonials.map((testimonial) => (
                    <FeedbackCard key={`fb-b-${testimonial.name}`} index={0} {...testimonial} />
                  ))}
                </div>
                <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                  {testimonials.map((testimonial) => (
                    <FeedbackCard key={`fb-c-${testimonial.name}`} index={0} {...testimonial} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default SectionWrapper(Feedbacks, "");
