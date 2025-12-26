import { useState, useEffect } from "react";
import { waterAPI, statisticsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface WaterLog {
  id: string;
  amount: number;
  timestamp: Date;
}

interface WaterTrackerState {
  currentAmount: number;
  goalAmount: number;
  logs: WaterLog[];
  streak: number;
  bestStreak: number;
}

export const useWaterTracker = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<WaterTrackerState>({
    currentAmount: 0,
    goalAmount: user?.dailyGoal || 2500,
    logs: [],
    streak: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch today's water intake
  const fetchTodayData = async () => {
    if (!isAuthenticated) return;

    try {
      const [waterResponse, streakResponse] = await Promise.all([
        waterAPI.getToday(),
        statisticsAPI.getStreak(),
      ]);

      setState({
        currentAmount: waterResponse.data.totalAmount || 0,
        goalAmount: waterResponse.data.goalAmount || user?.dailyGoal || 2500,
        logs: waterResponse.data.logs || [],
        streak: streakResponse.data.currentStreak || 0,
        bestStreak: streakResponse.data.bestStreak || 0,
      });
    } catch (error) {
      console.error("Failed to fetch water data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, [isAuthenticated]);

  const addWater = async (amount: number) => {
    try {
      await waterAPI.log(amount);
      // Refresh data after logging
      await fetchTodayData();
    } catch (error) {
      console.error("Failed to log water:", error);
      throw error;
    }
  };

  const setGoal = async (amount: number) => {
    try {
      await waterAPI.updateGoal(amount);
      setState((prev) => ({
        ...prev,
        goalAmount: amount,
      }));
    } catch (error) {
      console.error("Failed to update goal:", error);
      throw error;
    }
  };

  const resetDay = () => {
    setState((prev) => ({
      ...prev,
      currentAmount: 0,
      logs: [],
    }));
  };

  const percentage = Math.min((state.currentAmount / state.goalAmount) * 100, 100);

  return {
    currentAmount: state.currentAmount,
    goalAmount: state.goalAmount,
    logs: state.logs,
    streak: state.streak,
    bestStreak: state.bestStreak,
    percentage,
    loading,
    addWater,
    setGoal,
    resetDay,
    refresh: fetchTodayData,
  };
};
