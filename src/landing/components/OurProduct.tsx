import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

const slides = [
  {
    number: '01',
    title: 'Smart Collection Tracking',
    description:
      'Real-time GPS tracking of waste collection vehicles across every ward. Municipal managers get live dashboards showing route completion, missed pickups, and driver performance — all in one place.',
  },
  {
    number: '02',
    title: 'AI Waste Scanner',
    description:
      'Citizens and collection agents scan waste items using our AI-powered camera tool. The system instantly classifies waste type, logs it to the user\'s profile, and awards green points for correct segregation.',
  },
  {
    number: '03',
    title: 'Carbon Credit Market',
    description:
      'Every verified waste diversion event on the Waste OS platform generates traceable carbon offset data. Municipalities and businesses can trade these credits on our integrated carbon market.',
  },
  {
    number: '04',
    title: 'EPR Compliance Suite',
    description:
      'Automate your Extended Producer Responsibility reporting with CPCB-ready templates, producer dashboards, and verified take-back program coordination — reducing compliance overhead by up to 70%.',
  },
];


const slideDuration = 5; // seconds

const OurProduct: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slideshowVisible, setSlideshowVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const text = textRef.current;
    const placeholder = placeholderRef.current;
    const slideshow = slideshowRef.current;

    if (!container || !card || !placeholder || !slideshow) return;

    const { top, left } = placeholder.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const relativeTop = top - containerRect.top - 2;
    const relativeLeft = left - containerRect.left;

    gsap.set(card, {
      top: relativeTop,
      left: relativeLeft,
    });

    gsap.from(card, {
      y: 1,
      duration: 1.2,
      ease: CustomEase.create('slideUp', 'M0,0 C0.25,1 0.5,1 1,1'),
    });

    // Text fade in
    gsap.to(text, {
      opacity: 1,
      scrollTrigger: {
        trigger: container,
        start: 'top top+=100',
        end: 'bottom center',
        scrub: true,
      },
    });

    // Slideshow fade animation timeline (paused by default)
    const slideshowTimeline = gsap.timeline({ paused: true });
    slideshowTimeline.to(slideshow, {
      autoAlpha: 1,
      duration: 1,
      ease: 'power2.out',
    });

   let lastProgress = 0;
let lastDirection: number = 1; // 1 for down, -1 for up

ScrollTrigger.create({
  trigger: container,
  start: 'top top',
  end: '+=600vh',
  pin: true,
  scrub: 1,
  animation: gsap.to(card, {
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    x: 0,
    y: 0,
    borderRadius: 0,
    ease: 'none',
    marginLeft: 0,
  }),
  onUpdate: (self) => {
    const currentProgress = self.progress;

    // 🎯 When reaching end, show slideshow
    if (currentProgress === 1) {
      setSlideshowVisible(true);
      gsap.to(slideshowRef.current, {
        autoAlpha: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    // 🎯 When scrolls back up even a little, hide slideshow
    if (currentProgress < 1 && slideshowVisible) {
      setSlideshowVisible(false);
      gsap.to(slideshowRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  },
});


    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [slideshowVisible]);

  // Slide Progress Timer
 useEffect(() => {
  let timer: ReturnType<typeof setInterval>;

  if (slideshowVisible) {
    let startTime = Date.now();
    timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setProgress(elapsed);
      if (elapsed >= slideDuration) {
        startTime = Date.now();
        setProgress(0);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 100);
  }

  return () => clearInterval(timer);
}, [slideshowVisible]); // only run timer when visible


  return (
    <div className="bg-white text-black">
      <div ref={containerRef} className="h-screen relative bg-gray-200 overflow-hidden">
        {/* Card Grid */}
        <div className="grid grid-cols-5 gap-6 px-8 pt-8 mt-4 relative z-0">
          {[1, 2].map((n) => (
            <div key={n} className="w-80 h-96 bg-white rounded-2xl shadow-xl overflow-hidden">
              <img
                src={`https://picsum.photos/800/60${n}`}
                className="w-full h-full object-cover"
                alt={`Card ${n}`}
              />
            </div>
          ))}

          <div ref={placeholderRef} className="w-80 h-96 invisible" />

          {[4, 5].map((n) => (
            <div key={n} className="w-80 h-96 bg-white rounded-2xl shadow-xl overflow-hidden">
              <img
                src={`https://picsum.photos/800/60${n}`}
                className="w-full h-full object-cover"
                alt={`Card ${n}`}
              />
            </div>
          ))}
        </div>

        {/* Animated Card */}
        <div
          ref={cardRef}
          className="w-80 h-96 bg-white rounded-2xl shadow-2xl overflow-hidden absolute z-10"
          style={{ transformOrigin: 'center', top: 0 }}
        >
          <img
            src="https://picsum.photos/800/600"
            className="w-full h-full object-cover"
            alt="Zoomable"
          />
          <div
            ref={textRef}
            className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-0 bg-black/40"
          >
            Iron — Recycled
          </div>
        </div>

        {/* Slideshow Overlay */}
        <div
  ref={slideshowRef}
  className="fixed inset-0 z-20 bg-black text-white"
  style={{
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  }}
>

<div className="w-full h-full relative pointer-events-auto">
  {slides.map((slide, index) => (
    <div
      key={index}
      className="absolute inset-0 flex items-center justify-end px-16"
      style={{
        display: index === currentSlide ? 'flex' : 'none',
      }}
    >
      {/* Sliding white box */}
      <div className="w-[30rem] bg-white text-black rounded-lg p-8 shadow-xl animate-slide-in-right">
        <div className="text-blue-600 text-lg font-bold">{slide.number}</div>
        <div className="text-3xl font-extrabold mt-2">{slide.title}</div>
        <p className="text-sm text-gray-700 mt-4">{slide.description}</p>
      </div>
    </div>
  ))}

  {/* Bottom Slide Navigator */}
  <div className="absolute bottom-0 left-0 w-full px-16 py-4 bg-black/60 flex items-center justify-between text-white text-sm font-medium space-x-6">
    {slides.map((slide, index) => (
      <div key={index} className="flex-1 text-center relative">
        <div className={`${index === currentSlide ? 'text-white' : 'text-white/50'}`}>
          {slide.number} {slide.title}
        </div>
        <div className="w-full h-1 bg-white/20 mt-2 relative">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{
              width: index === currentSlide ? `${(progress / slideDuration) * 100}%` : '0%',
            }}
          />
        </div>
      </div>
    ))}
  </div>
</div>

</div>
        
      </div>
    </div>
  );
};

export default OurProduct;
