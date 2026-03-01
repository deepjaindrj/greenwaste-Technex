import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowRight } from 'lucide-react';
import { useCitizen } from '../../hooks/use-citizen';
import Hero from '../components/Hero';
import About from '../components/About';
import Challenge from '../components/Challenge';
import WhatWeDo from '../components/WhatWeDo';
import OurProduct from '../components/OurProduct';
import RecyclingSolution from '../components/RecyclingSolution';
import ScrollImageSection from '../components/ScrollImageSection'
import GlobeSection from '../components/GlobeSection';

const Home = () => {
  const navigate = useNavigate();
  const { setPortal, loading } = useCitizen();

  const handlePortal = (portal: 'citizen' | 'municipal') => {
    setPortal(portal);
    navigate(portal === 'citizen' ? '/dashboard' : '/municipal');
  };

  return (
    <div className="pt-20">
      <Hero
        imageUrl="/hero image.png"
        headlineWords={["Waste OS", "—", "The", "Smart", "City", "Waste", "Platform"]}
        showMarquee={true}
      >
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <button
            disabled={loading}
            onClick={() => handlePortal('citizen')}
            className="flex items-center gap-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-60"
          >
            <User className="w-5 h-5" />
            <span>Enter Citizen Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            disabled={loading}
            onClick={() => handlePortal('municipal')}
            className="flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white border border-white/50 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-white/30 hover:scale-105 transition-all duration-200 disabled:opacity-60"
          >
            <Building2 className="w-5 h-5" />
            <span>Enter Municipal Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </Hero>

      <About />
      <GlobeSection />
      <Challenge />
      {/* <WhatWeDo /> 
      <OurProduct />*/}
      <ScrollImageSection />
      <RecyclingSolution />
    </div>
  );
};

export default Home;