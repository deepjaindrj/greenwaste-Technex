import React, { useEffect, useState } from 'react';

export interface ServiceCard {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
}

interface BatteryCarouselProps {
  services: ServiceCard[];
  title: string;
  description: React.ReactNode; // So it can contain <span>, <strong>, etc.
}

const BatteryCarousel: React.FC<BatteryCarouselProps> = ({ services, title, description }) => {
  const [centerIndex, setCenterIndex] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [services.length]);

  const getRelativePosition = (cardIndex: number): number => {
    let position = cardIndex - centerIndex;
    if (position > 2) position -= services.length;
    if (position < -2) position += services.length;
    return position;
  };

  const getCardStyles = (relativePosition: number) => {
    const cardSpacing = window.innerWidth / 5.5;
    const translateX = relativePosition * cardSpacing;

    let scale = 1;
    let opacity = 1;
    let backgroundColor = 'bg-white';

    switch (relativePosition) {
      case 0:
        scale = 1.05;
        backgroundColor = 'bg-blue-50';
        break;
      case -1:
      case 1:
        scale = 0.95;
        opacity = 0.9;
        break;
      case -2:
      case 2:
        scale = 0.9;
        opacity = 0.8;
        break;
      default:
        scale = 0.85;
        opacity = 0.6;
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      backgroundColor,
      zIndex: relativePosition === 0 ? 20 : 10 - Math.abs(relativePosition),
    };
  };
  return (
    <div className="bg-white py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-6">{title}</h1>
        <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed text-lg">{description}</p>
      </div>

      <div className="relative h-[500px] overflow-visible flex justify-center items-center">
        <div className="relative flex items-center justify-center w-full">
          {services.map((service, index) => {
            const relativePosition = getRelativePosition(index);
            const styles = getCardStyles(relativePosition);

            return (
              <div
                key={service.id}
                className={`
                  absolute rounded-2xl shadow-lg border border-gray-200 p-8
                  transition-all duration-700 ease-in-out
                  ${styles.backgroundColor}
                  flex flex-col 
                  w-[calc(100vw/5.8)] h-[55vh]
                `}
                style={{
                  transform: styles.transform,
                  opacity: styles.opacity,
                  zIndex: styles.zIndex,
                }}
              >
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 leading-tight">
                    {service.title}
                  </h3>
                  <div className="flex-grow flex items-start overflow-hidden">
                    <p className="text-gray-600 text-md leading-relaxed text-justify">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BatteryCarousel;
