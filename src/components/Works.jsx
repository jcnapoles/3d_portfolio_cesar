import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
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
        className='p-5 rounded-2xl sm:w-[360px] w-full'
      >
        <div className='relative w-full h-[230px]'>
          <img
            src={image}
            alt='project_image'
            className='w-full h-full object-cover rounded-2xl'
            draggable={false}
          />

          <div className='absolute inset-0 flex justify-end m-3 space-x-3 card-img_hover'>
            <div
              onClick={() => window.open(link, "_blank")}
              className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer transform transition duration-500 ease-in-out hover:scale-110'
              title='Open preview'
              data-no-drag='true'
            >
              <FiEye className='w-1/2 h-1/2' />
            </div>
            {source_code_link && (
              <div
                onClick={() => window.open(source_code_link, "_blank")}
                className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer transform transition duration-500 ease-in-out hover:scale-110'
                title='Open source code'
                data-no-drag='true'
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
  // Build duplicated list for seamless marquee
  const firstHalfRef = useRef(null);
  const firstCardRef = useRef(null);
  const [durationSec, setDurationSec] = useState(30); // default duration
  const [paused, setPaused] = useState(false);
  const [offsetPx, setOffsetPx] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const trackInnerRef = useRef(null);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velRef = useRef(0); // px per ms
  const inertiaRafRef = useRef(null);
  const dragStartedRef = useRef(false);
  const DRAG_THRESHOLD = 6; // px
  const dragBlockRef = useRef(false);
  const pointerDownRef = useRef(false);

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

  // Recalculate duration based on content width for consistent speed
  useEffect(() => {
    const calc = () => {
      const w = firstHalfRef.current?.scrollWidth || 0;
      if (w > 0) {
        const pxPerSec = 80; // tune speed here (pixels per second)
        const dur = Math.max(10, Math.round(w / pxPerSec));
        setDurationSec(dur);
        // Center on the middle copy by shifting -w so there is content on both sides
        if (offsetPx === 0) {
          setOffsetPx(-w);
          dragStartOffsetRef.current = -w;
        } else {
          // If offset exists, normalize into (-w, 0]
          const norm = ((offsetPx % w) + w) % w; // [0, w)
          const wrapped = norm === 0 ? 0 : norm - w; // (-w, 0]
          setOffsetPx(wrapped);
          dragStartOffsetRef.current = wrapped;
        }
      }
      // Measure step as first card width + flex gap
      const cardEl = firstCardRef.current;
      if (cardEl) {
        const gapParent = cardEl.parentElement; // firstHalfRef container
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

  const nudge = (dir) => {
    // dir: +1 forward (to the right visually), -1 backward
    setPaused(true);
    const thirdWidth = firstHalfRef.current?.scrollWidth || 0;
    if (thirdWidth === 0 || stepPx === 0) return;
    setOffsetPx((prev) => {
      const next = prev + dir * stepPx;
      // wrap within one-third width
      const mod = ((next % thirdWidth) + thirdWidth) % thirdWidth;
      return mod;
    });
    // Optional: auto resume after a short delay
    window.clearTimeout((nudge._t));
    nudge._t = window.setTimeout(() => setPaused(false), 1500);
  };

  // Drag handlers for manual scroll
  const onPointerDown = (e) => {
    // Cancel inertia if running
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  // If starting from an interactive element, don't initiate drag
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
      if (Math.abs(dx) < DRAG_THRESHOLD) return; // not dragging yet; allow click
      dragStartedRef.current = true;
      setIsDragging(true);
    }
    const thirdWidth = firstHalfRef.current?.scrollWidth || 0;
    if (thirdWidth === 0) return;
  const next = dragStartOffsetRef.current + dx;
  // wrap into (-thirdWidth, 0]
  const norm = ((next % thirdWidth) + thirdWidth) % thirdWidth; // [0, w)
  const wrapped = norm === 0 ? 0 : norm - thirdWidth; // (-w, 0]
  setOffsetPx(wrapped);

    // Update velocity from last sample
    const dt = now - lastTRef.current;
    if (dt > 0) {
      const instDx = x - lastXRef.current;
      velRef.current = instDx / dt; // px per ms
      lastXRef.current = x;
      lastTRef.current = now;
    }
  };

  const endDrag = () => {
  pointerDownRef.current = false;
    // If a drag never started (click), just resume immediately
    if (!dragStartedRef.current || dragBlockRef.current) {
      setPaused(false);
      dragBlockRef.current = false;
      return;
    }
    setIsDragging(false);
    dragStartedRef.current = false;
    dragBlockRef.current = false;
    // Start inertia if sufficient velocity, else resume immediately
    const v0 = velRef.current;
    const minV = 0.05; // px/ms ~ 50 px/s
    if (Math.abs(v0) > minV) {
      startInertia(v0);
    } else {
      setPaused(false);
    }
  };

  const startInertia = (v0) => {
    setPaused(true);
    // Cancel if already running
    if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
    let v = v0;
    let prev = performance.now();
    const k = 0.005; // friction factor for exponential decay
    const step = (now) => {
      const w = firstHalfRef.current?.scrollWidth || 0;
      if (!w) {
        setPaused(false);
        inertiaRafRef.current = null;
        return;
      }
      const dt = now - prev;
      prev = now;
      // Update offset by velocity
      const next = offsetPx + v * dt;
      const norm = ((next % w) + w) % w; // [0, w)
      const wrapped = norm === 0 ? 0 : norm - w; // (-w, 0]
      setOffsetPx(wrapped);
      // Exponential decay of velocity
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

      <div
        className={`mt-10 relative overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
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
              {projects.map((project, i) => (
                <div key={`project-a-${project.name}`} ref={i === 0 ? firstCardRef : null}>
                  <ProjectCard index={0} {...project} />
                </div>
              ))}
            </div>
            <div className='flex flex-nowrap gap-2' aria-hidden='true'>
              {projects.map((project) => (
                <ProjectCard key={`project-b-${project.name}`} index={0} {...project} />
              ))}
            </div>
            <div className='flex flex-nowrap gap-2' aria-hidden='true'>
              {projects.map((project) => (
                <ProjectCard key={`project-c-${project.name}`} index={0} {...project} />
              ))}
            </div>
          </div>
        </div>

  {/* Removed arrow controls; drag to move */}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");
