import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Flame, Trophy, Droplets } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StatsCard from "@/components/StatsCard";
import { statisticsAPI } from "@/lib/api";

export default function Stats() {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [weekly, streak] = await Promise.all([
          statisticsAPI.getWeekly(),
          statisticsAPI.getStreak(),
        ]);
        setWeeklyData(weekly.data);
        setStreakData(streak.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <p className="text-lg">Loading statistics...</p>
      </div>
    );
  }

  const summary = weeklyData?.summary || {};
  const weekData = weeklyData?.weekData || [];

  return (
    <div className="min-h-screen hero-gradient pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header title="Statistics" subtitle="Track your hydration journey" />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard
            icon={Flame}
            label="Current Streak"
            value={`${streakData?.currentStreak || 0} days`}
            iconColor="text-warning"
          />
          <StatsCard
            icon={Trophy}
            label="Best Streak"
            value={`${streakData?.bestStreak || 0} days`}
            iconColor="text-success"
          />
          <StatsCard
            icon={Droplets}
            label="Week Total"
            value={`${(summary.totalAmount / 1000).toFixed(1)}L`}
            iconColor="text-water"
          />
          <StatsCard
            icon={TrendingUp}
            label="Daily Average"
            value={`${summary.averageAmount || 0}ml`}
            iconColor="text-primary"
          />
        </div>

        {/* Weekly Chart */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border/50 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">This Week</h3>
          </div>

          <div className="space-y-4">
            {weekData.map((day: any, index: number) => {
              const percentage = (day.totalAmount / day.goalAmount) * 100;
              const achieved = day.goalAchieved;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{day.dayName}</span>
                    <span className={achieved ? "text-success" : "text-muted-foreground"}>
                      {day.totalAmount}ml / {day.goalAmount}ml
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${achieved
                          ? "bg-gradient-to-r from-green-400 to-emerald-500"
                          : "bg-gradient-to-r from-cyan-400 to-blue-500"
                        }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Days Goal Achieved
              </span>
              <span className="text-lg font-bold text-primary">
                {summary.daysAchieved || 0} / 7
              </span>
            </div>
          </div>
        </div>

        {/* Streak History */}
        {streakData?.streakHistory && streakData.streakHistory.length > 0 && (
          <div className="bg-card rounded-3xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Streak History</h3>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {streakData.streakHistory.slice(-30).map((day: any, index: number) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg ${day.achieved
                      ? "bg-gradient-to-br from-green-400 to-emerald-500"
                      : "bg-muted"
                    }`}
                  title={`${day.date}: ${day.amount}ml`}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Last 30 days • Green = Goal achieved
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
