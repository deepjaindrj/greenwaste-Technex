import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;

    if (!card || !container) return;

    // Create the scaling animation
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=200vh",
      pin: container,
      scrub: 1,
      animation: gsap.to(card, {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        ease: "none",
      })
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-gray-900">
      {/* Initial section */}
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
        <h1 className="text-6xl font-bold text-white text-center">
          Scroll Down
          <br />
          <span className="text-2xl font-normal opacity-75">Watch the card expand</span>
        </h1>
      </div>

      {/* Card section - this will be pinned */}
      <div 
        ref={containerRef}
        className="h-screen bg-gray-800 relative"
      >
        <div
          ref={cardRef}
          className="w-80 h-64 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-white text-center">
            <div className="text-3xl font-bold mb-2">Expanding Card</div>
            <div className="text-lg opacity-80">Growing...</div>
          </div>
        </div>
      </div>

      {/* Spacer to create scroll distance */}
      <div className="h-[200vh] bg-gray-700">
        <div className="h-full flex items-center justify-center">
          <div className="text-white text-center opacity-50">
            <h2 className="text-4xl font-bold mb-4">Keep Scrolling</h2>
            <p className="text-xl">Card should be expanding above</p>
          </div>
        </div>
      </div>

      {/* Final section */}
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-700 to-black">
        <h3 className="text-4xl font-bold text-white text-center">
          Expansion Complete!
        </h3>
      </div>
    </div>
  );
};

export default ParallaxCard;