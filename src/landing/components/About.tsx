import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-8">
            The Operating System for Modern Waste Management
          </h2>
          
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-xl text-black-700 leading-relaxed"
            >
              <p className="mb-6">
                <strong>Waste OS</strong> is a comprehensive smart waste management platform built to transform how cities, municipalities, businesses, and citizens handle waste. We bridge the gap between waste generators and waste processors — creating a seamless, data-driven ecosystem that drives accountability, efficiency, and sustainability.
              </p>
              <p>
                From AI-powered waste scanning and real-time collection tracking to carbon credit markets and EPR compliance — Waste OS gives every stakeholder the tools they need to participate in a cleaner, greener economy. We don’t just manage waste. We turn it into measurable environmental value.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
