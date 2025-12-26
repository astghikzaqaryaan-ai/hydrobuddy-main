interface HydrationProgressProps {
  percentage: number;
}

const HydrationProgress = ({ percentage }: HydrationProgressProps) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative w-28 h-28">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="url(#waterGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${clampedPercentage * 3.02} 302`}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(195, 100%, 60%)" />
              <stop offset="100%" stopColor="hsl(187, 85%, 53%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-primary">{Math.round(clampedPercentage)}%</span>
          <span className="text-xs text-muted-foreground">hydrated</span>
        </div>
      </div>
      
      {/* Happy Drop Mascot */}
      <div className="mt-2 text-3xl animate-float">💧</div>
      
      {/* Encouragement Message */}
      <p className="mt-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
        {clampedPercentage >= 100 
          ? "Amazing! Goal reached! 🎉" 
          : clampedPercentage >= 75 
          ? "Great job! Keep it up! 💪" 
          : clampedPercentage >= 50 
          ? "Halfway there! 🌊" 
          : "Stay hydrated! 💧"}
      </p>
    </div>
  );
};

export default HydrationProgress;
