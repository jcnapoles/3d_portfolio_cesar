import React, { useState, useEffect, useRef, useMemo } from "react";
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
  isGrid,
}) => {
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className={`p-5 rounded-2xl w-[280px] sm:w-[340px] ${isGrid ? '' : 'sm:w-[360px]'}`}
      >
        <div className='relative w-full h-[180px] sm:h-[230px]'>
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
          <p className={`mt-2 text-secondary text-[14px] line-clamp-3 sm:line-clamp-4`}>{description}</p>
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
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = [...new Set(projects.map((p) => p.category))];
    return ["All", ...cats];
  }, []);

  const filteredProjects = useMemo(
    () =>
      activeFilter === "All"
        ? projects
        : projects.filter((p) => p.category === activeFilter),
    [activeFilter]
  );
  const isAllFilter = activeFilter === "All";
  const shouldLoopFiltered = filteredProjects.length > 2;

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
        // Reset offset to center on the middle copy
        setOffsetPx(-w);
        dragStartOffsetRef.current = -w;
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

  // Keep carousel running when switching filters
  useEffect(() => {
    setPaused(!isAllFilter);
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, [activeFilter, isAllFilter]);

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
          From SaaS platforms to 3D interfaces — each project reflects my approach to building 
          software: clean architecture, measurable impact, and end-to-end ownership.
          Explore live demos, source code, and the tech stack behind each one.
        </motion.p>
      </div>

      {/* Filter buttons */}
      <motion.div
        variants={fadeIn("up", "", 0.2, 0.6)}
        className='mt-8 flex flex-wrap gap-3 justify-center sm:justify-start'
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-300 border ${
              activeFilter === cat
                ? 'bg-[#915EFF] border-[#915EFF] text-white shadow-[0_0_12px_rgba(145,94,255,0.4)]'
                : 'bg-transparent border-secondary/30 text-secondary hover:border-[#915EFF]/60 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Carousel – shared by All and category filters */}
      <div
        className={`mt-10 relative overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        style={{ display: isAllFilter ? undefined : 'none' }}
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
      </div>

      {/* Filtered categories */}
      {activeFilter !== "All" && shouldLoopFiltered && (
        <motion.div
          key={`filtered-loop-${activeFilter}`}
          className='mt-10 relative overflow-hidden group select-none'
          initial='hidden'
          animate='show'
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          <div className='will-change-transform animate-marquee' style={{ ['--duration']: '20s' }}>
            <div className='flex flex-nowrap gap-2'>
              <div className='flex flex-nowrap gap-2'>
                {filteredProjects.map((project) => (
                  <ProjectCard key={`filtered-a-${project.name}`} index={0} {...project} />
                ))}
              </div>
              <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                {filteredProjects.map((project) => (
                  <ProjectCard key={`filtered-b-${project.name}`} index={0} {...project} />
                ))}
              </div>
              <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                {filteredProjects.map((project) => (
                  <ProjectCard key={`filtered-c-${project.name}`} index={0} {...project} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeFilter !== "All" && !shouldLoopFiltered && (
        <motion.div
          key={`filtered-static-${activeFilter}`}
          className='mt-10 flex flex-nowrap gap-2 overflow-x-auto pb-3 scrollbar-hide'
          initial='hidden'
          animate='show'
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={`filtered-static-${project.name}`} index={index} {...project} />
          ))}
        </motion.div>
      )}
    </>
  );
};

export default SectionWrapper(Works, "projects");
