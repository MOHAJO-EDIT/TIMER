import React, { useState, useRef, useEffect } from 'react';

interface ChassisWrapperProps {
  children: React.ReactNode;
  enable3DTilt?: boolean;
  theme?: 'dark' | 'light';
}

export const ChassisWrapper: React.FC<ChassisWrapperProps> = ({
  children,
  enable3DTilt = true,
  theme = 'dark',
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enable3DTilt) {
      setRotate({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (animFrameRef.current) return;

      animFrameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        // Subtle 3D tilt: max 5 degrees to keep text razor sharp & ultra-low GPU cost
        const rotY = Math.max(-6, Math.min(6, deltaX * 5));
        const rotX = Math.max(-6, Math.min(6, -deltaY * 5));

        setRotate({ x: rotX, y: rotY });
        animFrameRef.current = null;
      });
    };

    const handleMouseLeave = () => {
      setRotate({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enable3DTilt]);

  const isLight = theme === 'light';

  return (
    <div className="perspective-container w-full max-w-4xl mx-auto py-4 px-2 sm:px-4">
      <div
        ref={containerRef}
        className="preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: enable3DTilt
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            : 'none',
        }}
      >
        {/* Physical 3D Desk Chassis */}
        <div
          className={`relative rounded-3xl p-5 sm:p-8 backdrop-blur-md overflow-hidden transition-colors duration-300 ${
            isLight
              ? 'chassis-3d-light chassis-metal-light'
              : 'chassis-3d chassis-metal'
          }`}
        >
          {/* Top Screws for skeuomorphic 3D engineering aesthetic */}
          <div className={`absolute top-3 left-4 w-3.5 h-3.5 rounded-full shadow-inner flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-slate-200 to-slate-400 opacity-90' : 'bg-gradient-to-br from-slate-400 to-slate-700 opacity-70'}`}>
            <div className={`w-2 h-0.5 rotate-45 ${isLight ? 'bg-slate-600' : 'bg-slate-900'}`}></div>
          </div>
          <div className={`absolute top-3 right-4 w-3.5 h-3.5 rounded-full shadow-inner flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-slate-200 to-slate-400 opacity-90' : 'bg-gradient-to-br from-slate-400 to-slate-700 opacity-70'}`}>
            <div className={`w-2 h-0.5 -rotate-30 ${isLight ? 'bg-slate-600' : 'bg-slate-900'}`}></div>
          </div>
          <div className={`absolute bottom-3 left-4 w-3.5 h-3.5 rounded-full shadow-inner flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-slate-200 to-slate-400 opacity-90' : 'bg-gradient-to-br from-slate-400 to-slate-700 opacity-70'}`}>
            <div className={`w-2 h-0.5 rotate-12 ${isLight ? 'bg-slate-600' : 'bg-slate-900'}`}></div>
          </div>
          <div className={`absolute bottom-3 right-4 w-3.5 h-3.5 rounded-full shadow-inner flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-slate-200 to-slate-400 opacity-90' : 'bg-gradient-to-br from-slate-400 to-slate-700 opacity-70'}`}>
            <div className={`w-2 h-0.5 -rotate-45 ${isLight ? 'bg-slate-600' : 'bg-slate-900'}`}></div>
          </div>

          {/* Chamfered Metallic Edge Light */}
          <div className={`absolute inset-0 rounded-3xl pointer-events-none border glass-reflection ${isLight ? 'border-white/60' : 'border-white/10'}`}></div>

          {children}
        </div>
      </div>
    </div>
  );
};
