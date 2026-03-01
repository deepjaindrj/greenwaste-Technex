// src/components/ScrollImageSection.tsx
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Parallax, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/parallax';
import 'swiper/css/autoplay';

gsap.registerPlugin(ScrollTrigger);

interface SlideData {
  id: string;
  title: string;
  bg: string;
  desc: string;
}

const tiles: string[] = [
  '/card 01.png',
  '/card 02.png',
  '/card 03.png',
  '/card 04.png',
  '/card 05.png',
];

const slidesData: SlideData[] = [
  { id: '01', title: 'Citizen Scans',       bg: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1600&auto=format&fit=crop&q=80', desc: 'A citizen opens the Waste OS app, photographs a waste item, and our AI model classifies it in under a second — logging the scan and awarding Green Points instantly.' },
  { id: '02', title: 'Pickup Scheduled',    bg: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop&q=80', desc: 'The platform auto-assigns the nearest available collection driver, sends a real-time notification to the citizen, and slots the pickup into the optimised route for that ward.' },
  { id: '03', title: 'Driver Collects',     bg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&auto=format&fit=crop&q=80', desc: 'The driver receives the route on their Waste OS app, completes pickups with photo-proof verification, and syncs each collection event to the live municipal dashboard.' },
  { id: '04', title: 'Data Logged',         bg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80', desc: 'Every pickup is recorded with weight, waste type, GPS coordinates, and timestamp — feeding a unified dataset that powers reporting for municipalities, businesses, and EPR producers.' },
  { id: '05', title: 'Impact Measured',     bg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop&q=80', desc: 'Verified diversion events are converted into carbon offset data, ESG metrics, and EPR compliance records — giving every stakeholder a clear, auditable proof of environmental action.' },
];

export default function ScrollImageSection(): JSX.Element {
  // Refs for GSAP scroll section
  const sectionRef  = useRef<HTMLElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const tileRefs    = useRef<HTMLImageElement[]>([]);
  const overlayRef  = useRef<HTMLImageElement>(null);
  // Refs & state for Swiper carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [swiper, setSwiper]             = useState<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slideDuration = 5000; // milliseconds

  // ALWAYS reset tileRefs before each render
  tileRefs.current = [];

  // GSAP scroll-trigger animations (unchanged)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(tileRefs.current,    { yPercent: 100, opacity: 0 });
      gsap.set(overlayRef.current,  { autoAlpha: 0 });
      gsap.set(carouselRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'top top',
          end:     '+=500%',
          scrub:   1,
          pin:     true,
          invalidateOnRefresh: true,
        },
      });

      // Header reveal
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0
      ).to(
        textRef.current,
        { y: -150, duration: 0.5, ease: 'power2.out' },
        0.5
      );

      // Tile reveal
      tiles.forEach((_, i) => {
        tl.fromTo(
          tileRefs.current[i],
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power4.out' },
          2 + i * 0.3
        );
      });

      const revealEnd = 2 + (tiles.length - 1) * 0.3 + 0.5;
      // Snapshot center tile → expand full‐screen
      tl.set(
        overlayRef.current,
        {
          autoAlpha: 1,
          position:  'fixed',
          zIndex:    40,
          margin:    0,
          top:       () => `${tileRefs.current[2].getBoundingClientRect().top}px`,
          left:      () => `${tileRefs.current[2].getBoundingClientRect().left}px`,
          width:     () => `${tileRefs.current[2].getBoundingClientRect().width}px`,
          height:    () => `${tileRefs.current[2].getBoundingClientRect().height}px`,
        },
        revealEnd
      )
      .to(
        overlayRef.current,
        { top: 0, left: 0, width: '100vw', height: '100vh', borderRadius: 0, duration: 1, ease: 'power2.inOut' },
        revealEnd
      )
      .set(carouselRef.current, { autoAlpha: 1 }, revealEnd + 1);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate the cumulative progress bar whenever currentSlide changes
  useEffect(() => {
    if (!progressRef.current) return;
    const total   = slidesData.length;
    const start   = (currentSlide / total) * 100;
    const end     = ((currentSlide + 1) / total) * 100;
    const el      = progressRef.current;

    // reset and force reflow
    el.style.transition = 'none';
    el.style.width      = `${start}%`;
    void el.offsetWidth;

    // animate to end%
    el.style.transition = `width ${slideDuration}ms linear`;
    el.style.width      = `${end}%`;
  }, [currentSlide]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ height: '100vh' }}>
      {/* ===== Scroll‐trigger header ===== */}
      <div ref={textRef} className="absolute inset-x-0 top-1/3 flex flex-col items-center space-y-4 px-4">
        <span className="bg-[#16A34A] text-white uppercase text-xs px-3 py-1 rounded-full">How It Works</span>
        <h2 className="max-w-3xl text-center text-3xl font-bold text-gray-900">
          Five steps that turn everyday waste actions<br/>
          into city-wide environmental impact.
        </h2>
      </div>

      {/* ===== Scroll‐trigger tiles ===== */}
      <div className="absolute inset-x-4 flex justify-between gap-4" style={{ top: '40%' }}>
        {tiles.map((src, i) => (
          <img
            key={i}
            ref={(el) => { if (el) tileRefs.current[i] = el; }}
            src={src}
            alt={`Tile ${i + 1}`}
            style={{ width: 'calc((100% - 4rem)/5)' }}
            className="aspect-[4/5] object-cover rounded-2xl shadow-lg"
          />
        ))}
      </div>

      {/* ===== Expanding overlay ===== */}
      <img
        ref={overlayRef}
        src={tiles[2]}
        alt="Centre Tile"
        className="object-cover rounded-2xl shadow-lg"
        style={{ opacity: 0 }}
      />

      {/* ===== Swiper Carousel ===== */}
      <div ref={carouselRef} className="fixed inset-0 z-50 bg-black text-white" style={{ opacity: 0 }}>
        <div className="w-full h-full relative pointer-events-auto">
          <Swiper
            slidesPerView={1}
            spaceBetween={0}
            modules={[Navigation, Parallax, Autoplay]}
            parallax
            speed={600}
            autoplay={{ delay: slideDuration, disableOnInteraction: false }}
            navigation
            onSwiper={setSwiper}
            onSlideChange={(s) => setCurrentSlide(s.activeIndex)}
            className="h-full overflow-hidden"
          >
            {slidesData.map((slide, index) => (
              <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.bg})` }} data-swiper-parallax="30%" />
                <div className="absolute inset-0 flex items-center justify-end px-16">
                  <div className="w-[30rem] bg-white text-black rounded-lg p-8 shadow-xl animate-slide-in-right">
                    <div className="text-green-600 text-xl font-bold">{slide.id}</div>
                    <div className="text-3xl font-extrabold mt-2">{slide.title}</div>
                    <p className="text-sm text-gray-700 mt-4">{slide.desc}</p>
                  </div>
                </div>
                <h2 className={`${currentSlide === index ? 'animate-slide-up' : ''} absolute bottom-32 left-16 text-white font-bold text-5xl`} data-swiper-parallax="-100">
                  {slide.title}
                </h2>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Progress & nav */}
          <div className="absolute bottom-0 left-0 w-full py-8 bg-gradient-to-t from-black/90 to-transparent z-10">
            <div ref={progressRef} className="absolute bottom-0 left-0 h-1 bg-white w-0" />
            <div className="flex items-center text-white text-2xl font-medium">
              {slidesData.map((slide, index) => (
                <div key={slide.id} className="flex-1 text-center cursor-pointer" onClick={() => { swiper?.slideTo(index); swiper?.autoplay.start(); }}>
                  <span className={currentSlide === index ? 'text-white' : 'text-white/50'}>
                    {slide.id} {slide.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
Add this to your global CSS or Tailwind config:

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}
*/
