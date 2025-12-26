import { useEffect, useState } from "react";

interface WaterBottleProps {
  currentAmount: number;
  goalAmount: number;
}

const WaterBottle = ({ currentAmount, goalAmount }: WaterBottleProps) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const fillPercentage = Math.min((currentAmount / goalAmount) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedLevel(fillPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [fillPercentage]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Bottle Container */}
      <div className="relative w-32 h-48">
        {/* Bottle Cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-primary/80 to-primary rounded-t-lg z-10" />
        
        {/* Bottle Neck */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-card border-2 border-border rounded-t-sm" />
        
        {/* Bottle Body */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-40 bg-card border-2 border-border rounded-b-3xl rounded-t-lg overflow-hidden shadow-water">
          {/* Water Fill */}
          <div 
            className="absolute bottom-0 left-0 right-0 water-gradient transition-all duration-700 ease-out"
            style={{ height: `${animatedLevel}%` }}
          >
            {/* Wave Effect */}
            <div className="absolute top-0 left-1/2 w-[200%] h-4 animate-water-wave">
              <svg viewBox="0 0 200 10" className="w-full h-full fill-water-light/30">
                <path d="M0 5 Q25 0, 50 5 T100 5 T150 5 T200 5 V10 H0 Z" />
              </svg>
            </div>
            
            {/* Bubbles */}
            {animatedLevel > 10 && (
              <>
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-bubble/40 animate-bubble-rise" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-8 right-6 w-1.5 h-1.5 rounded-full bg-bubble/30 animate-bubble-rise" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-2 left-1/2 w-1 h-1 rounded-full bg-bubble/50 animate-bubble-rise" style={{ animationDelay: '1s' }} />
              </>
            )}
          </div>
          
          {/* Measurement Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4 px-1">
            {[75, 50, 25].map((mark) => (
              <div key={mark} className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-border/50" />
                <span className="text-[8px] text-muted-foreground">{mark}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Amount Display */}
      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-foreground">{currentAmount}ml</p>
        <p className="text-sm text-muted-foreground">of {goalAmount}ml goal</p>
      </div>
    </div>
  );
};

export default WaterBottle;
