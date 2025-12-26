import { Droplets, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogout?: boolean;
}

const Header = ({ title = "HydroBuddy", subtitle = "Stay hydrated, stay healthy!", showLogout = false }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="text-center pt-6 pb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1" />
        <div className="flex items-center justify-center gap-2">
          <Droplets className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-water to-primary bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="flex-1 flex justify-end">
          {showLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      {user && !showLogout && (
        <p className="text-xs text-muted-foreground mt-1">Welcome, {user.name}! 👋</p>
      )}
    </header>
  );
};

export default Header;
