import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAddButtonsProps {
  onAdd: (amount: number) => void;
  selectedAmount?: number;
}

const amounts = [150, 250, 500, 750];

const QuickAddButtons = ({ onAdd, selectedAmount }: QuickAddButtonsProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Add</h3>
        <Droplets className="w-5 h-5 text-primary" />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {amounts.map((amount) => (
          <Button
            key={amount}
            variant={selectedAmount === amount ? "quickAddActive" : "quickAdd"}
            size="quickAdd"
            onClick={() => onAdd(amount)}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Droplets className="w-4 h-4" />
            <span className="text-sm font-bold">+{amount}ml</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickAddButtons;
