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
  imageFit,
  noAnimation = false,
}) => {
  const inner = (
    <Tilt
      options={{ max: 45, scale: 1, speed: 450 }}
      className={`p-5 rounded-2xl w-[280px] sm:w-[340px] ${isGrid ? '' : 'sm:w-[360px]'}`}
    >
      <div className='relative w-full h-[180px] sm:h-[230px]'>
        <img
          src={image}
          alt='project_image'
          className={`w-full h-full rounded-2xl ${imageFit === "contain" ? "object-contain bg-tertiary" : "object-cover"}`}
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
              <img src={github} alt='source code' className='w-1/2 h-1/2 object-contain' />
            </div>
          )}
        </div>
      </div>
      <div className='mt-5'>
        <h3 className='text-white font-bold text-[24px]'>{name}</h3>
        <p className='mt-2 text-secondary text-[14px] line-clamp-3 sm:line-clamp-4'>{description}</p>
      </div>
      <div className='mt-4 flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <p key={`${name}-${tag.name}`} className={`text-[14px] ${tag.color}`}>
            #{tag.name}
          </p>
        ))}
      </div>
    </Tilt>
  );

  if (noAnimation) return inner;

  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      {inner}
    </motion.div>
  );
};

const SCROLL_SPEED = 60; // px per second

const Works = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [stepPx, setStepPx] = useState(0);

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
  const activeProjects = activeFilter === "All" ? projects : filteredProjects;
  const shouldLoopCarousel = activeProjects.length > 2;

  // Carousel refs
  const firstHalfRef = useRef(null);
  const firstCardRef = useRef(null);
  const trackInnerRef = useRef(null);

  // Animation state via refs (avoids 60fps re-renders)
  const dragOffsetRef = useRef(0);
  const autoScrollOffsetRef = useRef(0);
  const pausedRef = useRef(false);
  const autoRafRef = useRef(null);
  const inertiaRafRef = useRef(null);

  // Drag tracking refs
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velRef = useRef(0);
  const dragStartedRef = useRef(false);
  const dragBlockRef = useRef(false);
  const pointerDownRef = useRef(false);
  const DRAG_THRESHOLD = 6;

  // Keep pausedRef in sync for use inside RAF callbacks
  useEffect(() => { pausedRef.current = paused; }, [paused]);

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

  // Calculate step size for nudge
  useEffect(() => {
    const calc = () => {
      const cardEl = firstCardRef.current;
      if (cardEl) {
        const gapParent = cardEl.parentElement;
        const computedStyles = gapParent ? window.getComputedStyle(gapParent) : null;
        const gapStr = computedStyles?.getPropertyValue('column-gap') || computedStyles?.getPropertyValue('gap') || '8px';
        const gap = parseFloat(gapStr) || 8;
        const step = Math.round(cardEl.getBoundingClientRect().width + gap);
        setStepPx(step);
      }
    };
    calc();
    window.requestAnimationFrame(calc);
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [activeFilter, activeProjects.length]);

  // Reset all offsets when filter changes
  useEffect(() => {
    pausedRef.current = false;
    setPaused(false);
    dragOffsetRef.current = 0;
    autoScrollOffsetRef.current = 0;
    dragStartOffsetRef.current = 0;
    if (trackInnerRef.current) {
      trackInnerRef.current.style.transform = 'translateX(0px)';
    }
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, [activeFilter]);

  // Auto-scroll RAF loop — direct DOM mutation, no React state at 60fps
  useEffect(() => {
    if (!shouldLoopCarousel) return;

    let prevTime = null;

    const frame = (now) => {
      if (!pausedRef.current) {
        if (prevTime !== null) {
          const dt = now - prevTime;
          const w = firstHalfRef.current?.scrollWidth || 0;
          if (w > 0) {
            autoScrollOffsetRef.current -= (SCROLL_SPEED * dt) / 1000;
            // Wrap: keep within one copy width
            if (Math.abs(autoScrollOffsetRef.current) >= w) {
              autoScrollOffsetRef.current += w;
            }
          }
        }
      }
      prevTime = now;

      if (trackInnerRef.current) {
        const total = autoScrollOffsetRef.current + dragOffsetRef.current;
        trackInnerRef.current.style.transform = `translateX(${total}px)`;
      }

      autoRafRef.current = requestAnimationFrame(frame);
    };

    autoRafRef.current = requestAnimationFrame(frame);
    return () => {
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
    };
  }, [shouldLoopCarousel]);

  const nudge = (dir) => {
    pausedRef.current = true;
    setPaused(true);
    if (stepPx === 0) return;
    dragOffsetRef.current += dir * stepPx;
    window.clearTimeout(nudge._t);
    nudge._t = window.setTimeout(() => {
      pausedRef.current = false;
      setPaused(false);
    }, 1500);
  };

  const onPointerDown = (e) => {
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    dragBlockRef.current = isInteractiveTarget(e.target);
    pausedRef.current = true;
    setPaused(true);
    setIsDragging(false);
    dragStartedRef.current = false;
    dragStartXRef.current = e.clientX ?? (e.touches ? e.touches[0]?.clientX : 0);
    dragStartOffsetRef.current = dragOffsetRef.current;
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
    if (w > 0) {
      const raw = dragStartOffsetRef.current + dx;
      const norm = ((raw % w) + w) % w;
      dragOffsetRef.current = norm === 0 ? 0 : norm - w;
    } else {
      dragOffsetRef.current = dragStartOffsetRef.current + dx;
    }

    const dt = now - lastTRef.current;
    if (dt > 0) {
      velRef.current = (x - lastXRef.current) / dt;
      lastXRef.current = x;
      lastTRef.current = now;
    }
  };

  const endDrag = () => {
    pointerDownRef.current = false;
    if (!dragStartedRef.current || dragBlockRef.current) {
      pausedRef.current = false;
      setPaused(false);
      dragBlockRef.current = false;
      return;
    }
    setIsDragging(false);
    dragStartedRef.current = false;
    dragBlockRef.current = false;
    const v0 = velRef.current;
    if (Math.abs(v0) > 0.05) {
      startInertia(v0);
    } else {
      pausedRef.current = false;
      setPaused(false);
    }
  };

  const startInertia = (v0) => {
    pausedRef.current = true;
    setPaused(true);
    if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
    let v = v0;
    let prev = performance.now();
    const k = 0.005;
    const step = (now) => {
      const w = firstHalfRef.current?.scrollWidth || 0;
      if (!w) {
        inertiaRafRef.current = null;
        pausedRef.current = false;
        setPaused(false);
        return;
      }
      const dt = now - prev;
      prev = now;
      dragOffsetRef.current += v * dt;
      const norm = ((dragOffsetRef.current % w) + w) % w;
      dragOffsetRef.current = norm === 0 ? 0 : norm - w;
      v = v * Math.exp(-k * dt);
      if (Math.abs(v) < 0.01) {
        inertiaRafRef.current = null;
        pausedRef.current = false;
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

      {shouldLoopCarousel && (
        <div
          key={`loop-${activeFilter}`}
          className={`mt-10 relative overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          onMouseEnter={() => { pausedRef.current = true; setPaused(true); }}
          onMouseLeave={() => { pausedRef.current = false; setPaused(false); }}
          onFocus={() => { pausedRef.current = true; setPaused(true); }}
          onBlur={() => { pausedRef.current = false; setPaused(false); }}
          onTouchStart={() => { pausedRef.current = true; setPaused(true); }}
          onTouchEnd={() => { pausedRef.current = false; setPaused(false); }}
        >
          <div className='will-change-transform' tabIndex={0}>
            <div
              ref={trackInnerRef}
              className='flex flex-nowrap gap-2'
              style={{ touchAction: 'pan-y' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div className='flex flex-nowrap gap-2' ref={firstHalfRef}>
                {activeProjects.map((project, i) => (
                  <div key={`project-a-${activeFilter}-${project.name}`} ref={i === 0 ? firstCardRef : null}>
                    <ProjectCard index={0} {...project} noAnimation />
                  </div>
                ))}
              </div>
              <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                {activeProjects.map((project) => (
                  <ProjectCard key={`project-b-${activeFilter}-${project.name}`} index={0} {...project} noAnimation />
                ))}
              </div>
              <div className='flex flex-nowrap gap-2' aria-hidden='true'>
                {activeProjects.map((project) => (
                  <ProjectCard key={`project-c-${activeFilter}-${project.name}`} index={0} {...project} noAnimation />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!shouldLoopCarousel && (
        <motion.div
          key={`filtered-static-${activeFilter}`}
          className='mt-10 flex flex-nowrap gap-2 overflow-x-auto pb-3 scrollbar-hide'
          initial='hidden'
          animate='show'
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {activeProjects.map((project, index) => (
            <ProjectCard key={`filtered-static-${project.name}`} index={index} {...project} />
          ))}
        </motion.div>
      )}
    </>
  );
};

export default SectionWrapper(Works, "projects");
