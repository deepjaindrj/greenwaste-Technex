import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import BatteryCarousel, { ServiceCard } from '../components/RecyclingCaraousel';
import Threads from '../components/Threads';

const servicesData: ServiceCard[] = [
  {
    id: 1,
    title: "Citizen App & Rewards",
    description: "Citizens use the Waste OS app to report waste, schedule pickups, scan items for classification, and earn green points redeemable for rewards — turning everyday waste action into a habit.",
  },
  {
    id: 2,
    title: "Driver & Fleet Management",
    description: "Truck drivers receive optimised route assignments on their mobile app, log pickup completions with photo proof, and sync data in real time — eliminating manual trip sheets and missed collections.",
  },
  {
    id: 3,
    title: "Municipal Command Center",
    description: "Municipalities get a live operations dashboard tracking ward-level collection rates, vehicle locations, driver performance, and monthly compliance metrics — all in one unified view.",
  },
  {
    id: 4,
    title: "Business Waste Intelligence",
    description: "Businesses monitor waste generation trends, receive automated ESG-ready reports, and access carbon credit data to meet sustainability targets and EPR obligations with confidence.",
  },
  {
    id: 5,
    title: "AI-Powered Waste Scanner",
    description: "Our on-device AI model classifies waste type from a photo in under a second, guiding correct segregation at source and logging every scan to the platform for traceability.",
  },
];

const Recycling = () => {
  const recyclingServices = [
    {
      title: 'Electronic Waste Recycling',
      description: 'Comprehensive e-waste processing including computers, smartphones, and industrial electronics.',
      features: ['Data destruction', 'Component recovery', 'Precious metal extraction', 'Certified disposal'],
      image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    },
    {
      title: 'Metal Recovery',
      description: 'Advanced metal separation and purification processes for maximum value recovery.',
      features: ['Copper extraction', 'Aluminum processing', 'Steel recovery', 'Precious metals'],
      image: 'https://images.pexels.com/photos/6010/copper-metal-bars-metal-bars.jpg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    },
    {
      title: 'Plastic Processing',
      description: 'State-of-the-art plastic recycling with quality-maintained output materials.',
      features: ['Sorting & cleaning', 'Pelletization', 'Quality testing', 'Custom compounds'],
      image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    }
  ];

  const processSteps = [
    { step: '01', title: 'Collection', description: 'Secure pickup and transportation of waste materials' },
    { step: '02', title: 'Sorting', description: 'Advanced automated sorting using AI and optical recognition' },
    { step: '03', title: 'Processing', description: 'Specialized treatment and refinement processes' },
    { step: '04', title: 'Quality Control', description: 'Rigorous testing to ensure material standards' },
    { step: '05', title: 'Distribution', description: 'Delivery of high-quality recycled materials' }
  ];

  return (
    <div className="pt-20">
      <Hero
      imageUrl="https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg"
      headlineWords={["The", "Platform", "Built", "for", "Smarter", "Cities"]}
      showMarquee={false}
      />  
      <section className="relative py-20 bg-gray-100 overflow-hidden mt-10 ">
            {/* Threads as background (clipped, rotated) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="w-[100vw] h-full bottom-10 rotate-[-5deg] opacity-50">
                <Threads amplitude={2} distance={0} enableMouseInteraction={false} />
              </div>
            </div>
      
            <div className="relative z-10 max-w-4xl mx-auto">      
              <div className="grid lg:grid-cols-1 gap-16 items-center text-center">
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl font-bold text-gray-900 mb-8">
                    Why Smart Waste Management?
                  </h2>
                  <div className="space-y-6 max-w-3xl mx-auto">
                    <p className="text-md text-center text-black-600 leading-relaxed">
                     India generates over 150,000 metric tonnes of municipal solid waste every single day — yet less
                    than 30% of it is scientifically processed or recycled. The gap between waste generated and waste
                    managed is widening with every passing year as urbanisation accelerates.
                    </p>
                    <p className="text-md text-center  text-black-600 leading-relaxed">
                    The India waste management market is projected to reach $13.7 billion by 2028, driven by rising
                    urban populations, new regulations, and growing demand for ESG compliance. Cities, businesses,
                    and producers are all under pressure to demonstrate measurable waste action.
                    </p>
                    <p className="text-md text-center  text-black-600 leading-relaxed">
                    Without a connected digital platform, waste data stays siloed across departments and stakeholders.
                    Waste OS bridges that gap — unifying citizens, collection drivers, municipalities, and businesses
                    onto one real-time operating system so that every kilogram of waste is tracked, measured, and
                    turned into actionable insight.
                    </p>             
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">How Waste OS Works</h2>
          <p className="text-lg text-gray-600 mb-12">
            A simple, closed-loop flow that connects every stakeholder from waste generation to impact measurement.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Citizen Scans', 'Pickup Scheduled', 'Driver Collects', 'Data Logged', 'Impact Measured'].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <p className="text-gray-700 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <BatteryCarousel
      services={servicesData}
      title="Platform Features"
      description={
        <>
          At <span className="font-semibold text-green-800">Waste OS</span>, we've built every feature around the real-world needs of
          citizens, drivers, municipalities, and businesses. From AI-powered waste scanning to live fleet tracking, every
          tool on the platform is designed to make smart waste management effortless and measurable:
        </>
        }
        />
      </div>
  );
};

export default Recycling;