import { Play, Pause, RotateCcw, Volume2, VolumeX, RefreshCw, Droplets } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTimer } from "@/hooks/useTimer";

const Timer = () => {
  const {
    minutes,
    seconds,
    isRunning,
    autoRestart,
    soundEnabled,
    displayMinutes,
    displaySeconds,
    start,
    pause,
    resume,
    reset,
    setMinutes,
    setSeconds,
    toggleAutoRestart,
    toggleSound,
    timeLeft,
  } = useTimer();

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="min-h-screen hero-gradient pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header title="Hydration Timer" subtitle="Never forget to drink water" />

        {/* Timer Display Card */}
        <div className="bg-card rounded-3xl p-8 shadow-water border border-border/50 mb-6 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Droplets className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">Hydration Timer</h2>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-primary tracking-wider">
              {formatTime(displayMinutes)}:{formatTime(displaySeconds)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isRunning ? "Time until next drink" : "Set your reminder time"}
            </p>
          </div>

          {/* Time Input */}
          {!isRunning && timeLeft === minutes * 60 + seconds && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <label className="text-xs text-muted-foreground block mb-1">Minutes</label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-lg font-bold"
                />
              </div>
              <div className="text-center">
                <label className="text-xs text-muted-foreground block mb-1">Seconds</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-lg font-bold"
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <Button variant="water" size="lg" onClick={timeLeft === minutes * 60 + seconds ? start : resume} className="gap-2">
                <Play className="w-5 h-5" />
                {timeLeft === minutes * 60 + seconds ? "Start" : "Resume"}
              </Button>
            ) : (
              <Button variant="water" size="lg" onClick={pause} className="gap-2">
                <Pause className="w-5 h-5" />
                Pause
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={reset}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-foreground mb-4">Timer Settings</h3>
          
          <div className="space-y-4">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-foreground">Alarm Sound</span>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
            </div>

            {/* Auto Restart Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className={`w-5 h-5 ${autoRestart ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-foreground">Auto Restart</span>
              </div>
              <Switch checked={autoRestart} onCheckedChange={toggleAutoRestart} />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-secondary/50 rounded-2xl p-4 mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-muted-foreground text-center">
            💡 Set a timer to remind yourself to drink water regularly. Staying hydrated improves focus and energy!
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Timer;
