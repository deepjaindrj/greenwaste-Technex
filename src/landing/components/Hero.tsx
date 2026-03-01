import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface HeroProps {
  imageUrl: string;
  headlineWords?: string[];
  showMarquee?: boolean;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  imageUrl,
  headlineWords = [],
  showMarquee = false,
  children,
}) => {
  const { scrollY } = useScroll();

  // Raw transforms
  const rawImageScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const rawScaleX = useTransform(scrollY, [0, 500], [1, 1.08]);
  const rawPaddingX = useTransform(scrollY, [0, 500], [28, 0]); // px-4 = 16px
  const rawPaddingB = useTransform(scrollY, [0, 500], [28, 0]); // pb-4 = 16px

  // Smoothed transforms using spring
  const imageScale = useSpring(rawImageScale, {
    stiffness: 50,
    damping: 20,
    mass: 0.8,
  });

  const scaleX = useSpring(rawScaleX, {
    stiffness: 40,
    damping: 30,
    mass: 1.2,
  });

  const paddingX = useSpring(rawPaddingX, {
    stiffness: 60,
    damping: 50,
    mass: 1,
  });

  const paddingB = useSpring(rawPaddingB, {
    stiffness: 40,
    damping: 30,
    mass: 1.2,
  });

  return (
    <section className="relative pt-6 overflow-hidden bg-transparent">
      <motion.div
        className="relative w-full"
        initial={{ scale: 1.05, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingBottom: paddingB,
        }}
      >
        <motion.div
          className="relative h-screen overflow-hidden rounded-3xl"
          style={{ scaleX }}
        >
          <motion.img
            src={imageUrl}
            alt="Hero background"
            className="w-full h-[82vh] object-cover rounded-3xl"
            style={{ scale: imageScale }}
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-20 px-4">
            <div className="mb-8 flex flex-wrap justify-center text-3xl md:text-6xl font-black leading-tight">
              {headlineWords.map((word, index) => (
                <motion.span
                  key={index}
                  className="mx-1 text-white [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_0_6px_24px_rgba(0,0,0,0.7)]"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + index * 0.1,
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + headlineWords.length * 0.1, duration: 0.6, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showMarquee && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-23 w-full mb-16"
        >
          <div className="relative w-full whitespace-nowrap py-4">
            <motion.div
              animate={{ x: ['0%', '-100%'] }}
              transition={{
                repeat: Infinity,
                duration: 60,
                ease: 'linear',
              }}
              className="flex whitespace-nowrap"
            >
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className="text-4xl md:text-9xl font-bold mr-10 text-gray-400 leading-none"
                >
                  Smart Waste. Cleaner Cities. Better Planet.
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
