import React from 'react';
import { motion } from 'framer-motion';
import Globe from './newGlobe'; 

const GlobeSection = () => {
  return (
    <section className="py-12 lg:py-20 bg-white">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-8 lg:mb-12 text-center px-4">
        India's Waste Management Opportunity by 2030
      </h2>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Interactive 3D Globe - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full max-w-sm lg:max-w-none aspect-square flex items-center justify-center order-1 lg:order-none"
          >
            <Globe
              theta={0.1}
              dark={0}
              scale={0.8}                    // Reduced scale for mobile
              diffuse={1.5}
              baseColor="#4A90E2"
              markerColor="#27AE60"
              glowColor="#A9DFBF"
              mapBrightness={2}
            />
          </motion.div>

          {/* Content Cards - Mobile optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full order-2 lg:order-none"
          >
            {/* Mobile: 1 column, Tablet: 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-lg sm:max-w-none mx-auto">
              {[
                {
                  stat: '150,000 MT/day',
                  label: 'MSW Generated Daily in India',
                },
                {
                  stat: '<30%',
                  label: 'Waste Processed or Recycled',
                },
                {
                  stat: '$13.7 Billion',
                  label: 'India Waste Mgmt Market by 2028',
                },
                {
                  stat: '5,000+',
                  label: 'Urban Local Bodies to Digitise',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center min-h-[120px] lg:min-h-[140px] border border-gray-200"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 text-center mb-2 leading-tight">
                    {item.stat}
                  </div>
                  <div className="text-sm lg:text-base font-medium text-gray-700 text-center leading-relaxed">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GlobeSection;
