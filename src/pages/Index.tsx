import { useState } from "react";
import { Target, Flame, Trophy, Droplets } from "lucide-react";
import Header from "@/components/Header";
import WaterBottle from "@/components/WaterBottle";
import HydrationProgress from "@/components/HydrationProgress";
import QuickAddButtons from "@/components/QuickAddButtons";
import StatsCard from "@/components/StatsCard";
import FloatingBlob from "@/components/FloatingBlob";
import BottomNav from "@/components/BottomNav";
import { useWaterTracker } from "@/hooks/useWaterTracker";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [lastAdded, setLastAdded] = useState<number | undefined>();
  const { currentAmount, goalAmount, percentage, streak, bestStreak, addWater } = useWaterTracker();

  const handleAddWater = (amount: number) => {
    addWater(amount);
    setLastAdded(amount);
    
    toast({
      title: `+${amount}ml added! 💧`,
      description: percentage + (amount / goalAmount * 100) >= 100 
        ? "Amazing! You've reached your daily goal!" 
        : "Keep going, you're doing great!",
    });

    // Reset selected state after animation
    setTimeout(() => setLastAdded(undefined), 300);
  };

  return (
    <div className="min-h-screen hero-gradient pb-24">
      <FloatingBlob hydrationLevel={percentage} />
      
      <div className="container max-w-lg mx-auto px-4">
        <Header />
        
        {/* Main Card */}
        <div className="bg-card rounded-3xl p-6 shadow-water border border-border/50 mb-6 animate-fade-in">
          <div className="flex items-center justify-around gap-4">
            <WaterBottle currentAmount={currentAmount} goalAmount={goalAmount} />
            <HydrationProgress percentage={percentage} />
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border/50 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <QuickAddButtons onAdd={handleAddWater} selectedAmount={lastAdded} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatsCard 
            icon={Target} 
            label="Daily Goal" 
            value={`${goalAmount}ml`}
            iconColor="text-primary"
          />
          <StatsCard 
            icon={Flame} 
            label="Streak" 
            value={`${streak} days`}
            subtitle="Keep it going! 🔥"
            iconColor="text-warning"
          />
          <StatsCard 
            icon={Trophy} 
            label="Best Streak" 
            value={`${bestStreak} days`}
            subtitle="You can do better!"
            iconColor="text-success"
          />
          <StatsCard 
            icon={Droplets} 
            label="Today" 
            value={currentAmount >= 1000 ? `${(currentAmount / 1000).toFixed(1)}L` : `${currentAmount}ml`}
            subtitle="Keep drinking!"
            iconColor="text-water"
          />
        </div>

        {/* Hydration Tip */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-warning/20 text-warning">
              💡
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Hydration Tip</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Water helps your skin glow. Expensive skincare? Nah, just hydrate! ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
