import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView,Variants } from 'framer-motion';

type ChallengeType = {
  type: 'image' | 'text';
  image?: string;
  title?: string;
  description?: string;
  bgColor?: string;
};

const challenges: ChallengeType[] = [
  {
    type: 'image',
    image:
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'text',
    title: 'Overflowing Landfills',
    description:
      'Urban areas worldwide are running out of landfill space as waste volumes grow faster than infrastructure. Without intelligent routing and real-time monitoring, municipalities struggle to respond before overflow becomes a public health crisis.',
    bgColor: 'bg-green-100',
  },
  {
    type: 'image',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'text',
    title: 'Lack of Waste Traceability',
    description:
      'Most waste management systems operate in silos — no single source of truth from generation to disposal. This opacity makes it impossible to verify EPR compliance, measure diversion rates, or reward sustainable behaviour.',
    bgColor: 'bg-emerald-100',
  },
  {
    type: 'image',
    image:
      'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'text',
    title: 'Disconnected Stakeholders',
    description:
      'Citizens, haulers, processors, and regulators each use different tools with no shared data layer. Waste OS closes this gap — creating one interconnected platform that aligns incentives and drives accountability across the entire waste value chain.',
    bgColor: 'bg-teal-100',
  },
];

const riseUpStrong = {
  hidden: {
    opacity: 0,
    y: 120,
    scale: 0.95,
    filter: 'blur(6px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: Math.floor(i / 3) * 0.3,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
} as Variants;


const CardComponent: React.FC<{ challenge: ChallengeType; index: number }> = ({
  challenge,
  index,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={riseUpStrong}
      initial="hidden"
      animate={controls}
      custom={index}
    >
      {challenge.type === 'image' ? (
        <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-[65vh]">
          <img
            src={challenge.image}
            alt="Challenge"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
        </div>
      ) : (
        <div
          className={`${challenge.bgColor} rounded-2xl p-12 h-[65vh] shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200 flex flex-col justify-between`}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {challenge.title}
          </h3>
          <p className="text-black-700 leading-snug text-lg text-base">
            {challenge.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const Challenge: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">
            The Problems We Solve
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <CardComponent key={index} challenge={challenge} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Challenge;
