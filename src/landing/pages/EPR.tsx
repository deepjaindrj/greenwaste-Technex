import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import BatteryCarousel, { ServiceCard } from '../components/RecyclingCaraousel';

const servicesData: ServiceCard[] = [
  {
    id: 1,
    title: "Automated Data Collection",
    description: "Waste OS automatically captures waste generation and collection data across all touchpoints — citizens, businesses, and collection agents — feeding it directly into your EPR compliance dashboard.",
  },
  {
    id: 2,
    title: "CPCB-Ready Reporting",
    description: "Generate audit-ready compliance reports aligned with CPCB guidelines and India's Extended Producer Responsibility frameworks — in minutes, not weeks.",
  },
  {
    id: 3,
    title: "Producer Dashboard",
    description: "Producers get a real-time view of their EPR targets, fulfilment status, and registered take-back volumes, enabling proactive compliance management throughout the year.",
  },
  {
    id: 4,
    title: "Verified Take-Back Programs",
    description: "Our platform connects producers with certified waste processors and collection networks, ensuring every unit of waste collected is traceable, documented, and verifiable.",
  },
  {
    id: 5,
    title: "Multi-Stakeholder Coordination",
    description: "Waste OS bridges producers, Urban Local Bodies, recyclers, and regulators on a single platform — reducing coordination friction and ensuring everyone meets their EPR obligations.",
  },
];

const EPR = () => {
  const eprServices = [
    {
      title: 'Compliance Management',
      description: 'Complete EPR compliance solutions to meet regulatory requirements',
      icon: '📋'
    },
    {
      title: 'Reporting & Documentation',
      description: 'Comprehensive reporting systems for transparent compliance tracking',
      icon: '📊'
    },
    {
      title: 'Collection Networks',
      description: 'Nationwide collection infrastructure for efficient waste management',
      icon: '🌐'
    },
    {
      title: 'Producer Support',
      description: 'End-to-end support for producers to meet their EPR obligations',
      icon: '🤝'
    }
  ];

  const benefits = [
    'Regulatory Compliance',
    'Cost Optimization',
    'Environmental Impact Reduction',
    'Brand Reputation Enhancement',
    'Operational Efficiency',
    'Risk Mitigation'
  ];

  return (
    <div className="pt-20">
      <Hero
      imageUrl="https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg"
      headlineWords={["EPR", "Compliance", "—", "Powered", "by", "Waste", "OS"]}
      showMarquee={false}
      />  

      {/* What is EPR Section */}
        <section className="py-20 bg-white mb-20">
          <div className="mx-auto px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-black-900 mb-4">
                  What is Extended Producer Responsibility (EPR)?
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  <strong>Extended Producer Responsibility (EPR)</strong> is an environmental policy framework
                  that holds producers accountable for the entire lifecycle of their products — from design
                  through take-back, recycling, and final disposal. In India, EPR mandates under CPCB rules
                  govern categories including plastics, e-waste, batteries, and tyres, requiring producers to
                  meet annual collection and recycling targets.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-black-900 mb-4">
                  How Waste OS Simplifies EPR
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  At <strong>Waste OS</strong>, we eliminate the compliance burden by digitising every step
                  of your EPR journey. Our platform automates data collection, generates CPCB-ready reports,
                  connects you with verified take-back networks, and gives producers a real-time view of
                  their fulfilment status — so you stay ahead of targets without the paperwork overhead.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

       <BatteryCarousel
      services={servicesData}
      title="How Our EPR Module Works"
      description={
        <>
        </>
      }
    />

      <section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-16 items-start">
      {/* Left Side Content */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">EPR Partnership</p>
        <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
          Meet Your Compliance Targets with Waste OS
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Whether you're a plastic producer, an e-waste generator, or a tyre manufacturer, Waste OS
          gives you the digital infrastructure to track, report, and prove EPR compliance with ease.
        </p>
        <p className="text-lg text-gray-600">
          Fill in the form to schedule a demo and see how Waste OS can cut your compliance overhead
          by up to 70% — leaving you free to focus on what you do best.
        </p>
      </div>

      {/* Right Side Form */}
      <div className="space-y-6">
        <input
          type="text"
          placeholder="Full Name*"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Mobile Number*"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          placeholder="E-mail ID*"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Organisation Name*"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="City*"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <textarea
          placeholder="Describe Your Requirements*"          
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</section>

    </div>
  );
};

export default EPR;