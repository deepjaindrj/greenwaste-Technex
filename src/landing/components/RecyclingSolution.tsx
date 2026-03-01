import React from 'react';
import { motion } from 'framer-motion';

const OtherRecyclingSolutions = () => {
  const solutions = [
    {
      title: 'For Municipalities',
      description:
        'Get a real-time command centre to manage collection fleets, monitor ward-level performance, track citizen engagement, and automate compliance reporting — all in one place.',
      buttonText: 'Get Started'
    },
    {
      title: 'For Businesses',
      description:
        'Track waste output by category, measure your ESG footprint, earn and trade carbon credits, and generate regulatory-ready documentation with zero manual effort.',
      buttonText: 'Get Started'
    },
    {
      title: 'For Citizens',
      description:
        'Scan your waste, schedule pickups, track your environmental impact, earn Green Points, and redeem rewards — turning everyday decisions into city-wide sustainability wins.',
      buttonText: 'Join Now'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-green-800">
            Who Is Waste OS For?
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 bg-gray-50 rounded-2xl shadow-sm overflow-hidden py-20">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className={`flex flex-col justify-between px-10 h-[40vh] text-center ${
                index !== solutions.length - 1 ? 'md:border-r md:border-black' : ''
              }`}
            >
              {/* Title at the top */}
              <h3 className="text-2xl font-bold text-black">
                {solution.title}
              </h3>

              {/* Description and button at the bottom */}
              <div className="flex flex-col gap-6">
                <p className="text-black text-lg text-snug">
                  {solution.description}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] w-[60%] mx-auto text-white font-medium px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-green-500/40 hover:scale-105 transition-all duration-200"
                >
                  {solution.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OtherRecyclingSolutions;
