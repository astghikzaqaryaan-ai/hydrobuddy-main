import { useEffect, useState } from "react";

interface FloatingBlobProps {
  hydrationLevel: number; // 0-100
}

const FloatingBlob = ({ hydrationLevel }: FloatingBlobProps) => {
  const [position, setPosition] = useState({ x: 20, y: 70 });
  const [isHappy, setIsHappy] = useState(false);

  // Calculate size based on hydration level (40px to 80px)
  const size = 40 + (hydrationLevel / 100) * 40;
  
  // Change expression based on hydration
  useEffect(() => {
    setIsHappy(hydrationLevel >= 50);
  }, [hydrationLevel]);

  // Random floating movement
  useEffect(() => {
    const moveBlob = () => {
      setPosition({
        x: 10 + Math.random() * 20,
        y: 60 + Math.random() * 20,
      });
    };

    const interval = setInterval(moveBlob, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-[3000ms] ease-in-out"
      style={{
        left: `${position.x}%`,
        bottom: `${position.y}px`,
      }}
    >
      <div
        className="relative animate-float"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Blob Body */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-blob-pulse drop-shadow-lg"
        >
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(195, 100%, 65%)" />
              <stop offset="100%" stopColor="hsl(187, 85%, 50%)" />
            </linearGradient>
            <filter id="blobShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
            </filter>
          </defs>
          
          {/* Main blob shape */}
          <ellipse
            cx="50"
            cy="55"
            rx="40"
            ry="35"
            fill="url(#blobGradient)"
            filter="url(#blobShadow)"
          />
          
          {/* Highlight */}
          <ellipse
            cx="35"
            cy="45"
            rx="12"
            ry="8"
            fill="hsl(195, 100%, 80%)"
            opacity="0.6"
          />
        </svg>
        
        {/* Face */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '10%' }}>
          {/* Eyes */}
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-foreground/80" />
            <div className="w-2 h-2 rounded-full bg-foreground/80" />
          </div>
        </div>
        
        {/* Mouth */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300"
          style={{ top: '55%' }}
        >
          {isHappy ? (
            <div className="w-4 h-2 border-b-2 border-foreground/70 rounded-b-full" />
          ) : (
            <div className="w-3 h-1.5 border-t-2 border-foreground/70 rounded-t-full" />
          )}
        </div>
        
        {/* Blush when happy */}
        {isHappy && hydrationLevel >= 75 && (
          <>
            <div 
              className="absolute w-2 h-1 rounded-full bg-pink-300/50"
              style={{ left: '25%', top: '55%' }}
            />
            <div 
              className="absolute w-2 h-1 rounded-full bg-pink-300/50"
              style={{ right: '25%', top: '55%' }}
            />
          </>
        )}
      </div>
      
      {/* Size indicator for very hydrated */}
      {hydrationLevel >= 90 && (
        <div className="absolute -top-2 -right-2 text-lg">✨</div>
      )}
    </div>
  );
};

export default FloatingBlob;
