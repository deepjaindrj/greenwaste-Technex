import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScrollWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Enable Lenis-compatible body styles
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        } as any);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      // Restore scroll when navigating away from landing pages
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollWrapper;
