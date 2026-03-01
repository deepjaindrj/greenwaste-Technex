import React from 'react';
import { motion } from 'framer-motion';
import Threads from './Threads';

const WhatWeDo = () => {
  return (
    <section className="relative py-20 bg-white overflow-hidden mt-10">
      {/* Threads as background (clipped, rotated) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-[100vw] h-full origin-bottom-left rotate-[-2deg] opacity-50">
          <Threads amplitude={4} distance={0.1} enableMouseInteraction={false} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">      
        <div className="grid lg:grid-cols-1 gap-16 items-center text-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              What We Do?
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-8">
              Turning Waste Data into City-Wide Action
            </h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-xl text-black-600 leading-relaxed">
                <span className='font-bold'>Waste OS</span> connects citizens, truck drivers, municipalities, and businesses on a single intelligent platform — making waste collection smarter, faster, and fully traceable from pickup to processing.
              </p>
              <p className="text-xl text-black-600 leading-relaxed">
                Using AI-powered scanning, real-time dashboards, and gamified incentives, we transform everyday waste disposal into a measurable sustainability action — rewarding participation and enabling EPR compliance at scale.
              </p>             
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
