import { useState } from "react";
import { User, Target, Bell, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useWaterTracker } from "@/hooks/useWaterTracker";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { goalAmount, setGoal } = useWaterTracker();
  const [notifications, setNotifications] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(goalAmount.toString());

  const handleSaveGoal = async () => {
    const goal = parseInt(newGoal);
    if (goal > 0 && goal <= 10000) {
      try {
        await setGoal(goal);
        setEditingGoal(false);
        toast({
          title: "Goal updated! 🎯",
          description: `Your new daily goal is ${goal}ml`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update goal",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "See you soon! Stay hydrated! 💧",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen hero-gradient pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header title="Settings" subtitle="Customize your experience" showLogout />

        {/* Profile Section */}
        <div className="bg-card rounded-3xl p-6 shadow-water border border-border/50 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full water-gradient flex items-center justify-center text-3xl">
              {user?.avatar || "💧"}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{user?.name || "User"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Daily Goal */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Daily Goal</p>
                  <p className="text-sm text-muted-foreground">Set your water intake target</p>
                </div>
              </div>
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-24"
                  />
                  <Button size="sm" onClick={handleSaveGoal}>
                    Save
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="flex items-center gap-1 text-primary"
                >
                  <span className="font-medium">{goalAmount}ml</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">Get hydration reminders</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
          >
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <LogOut className="w-5 h-5" />
            </div>
            <p className="font-medium text-destructive">Log Out</p>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-muted-foreground">HydroBuddy v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">Stay hydrated, stay healthy! 💧</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
