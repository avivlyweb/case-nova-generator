import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { autoFillService, type AutoFillData } from "@/services/autoFillService";
import { motion } from "framer-motion";

interface MagicWandButtonProps {
  primaryCondition: string;
  specialization?: string;
  onAutoFill: (data: AutoFillData) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const MagicWandButton = ({
  primaryCondition,
  specialization = "",
  onAutoFill,
  disabled = false,
  size = "default",
  variant = "outline"
}: MagicWandButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleMagicWand = async () => {
    if (!primaryCondition.trim()) {
      toast({
        title: "Primary Condition Required",
        description: "Please enter a primary condition first to use the magic wand.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Magic wand activated for:', primaryCondition);
      
      // Try AI-powered auto-fill first, fallback to template-based
      const autoFillData = await autoFillService.generateAIAutoFillData(
        primaryCondition,
        specialization
      );

      // Apply the auto-filled data
      onAutoFill(autoFillData);

      toast({
        title: "✨ Magic Applied!",
        description: `Auto-filled case study data for ${primaryCondition}`,
      });

    } catch (error) {
      console.error('Magic wand error:', error);
      toast({
        title: "Magic Wand Failed",
        description: "Unable to auto-fill data. Please try again or fill manually.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={handleMagicWand}
        disabled={disabled || isGenerating || !primaryCondition.trim()}
        variant={variant}
        size={size}
        className={`
          relative overflow-hidden transition-all duration-200
          ${variant === "outline" 
            ? "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400" 
            : ""
          }
          ${isGenerating ? "animate-pulse" : ""}
        `}
      >
        {/* Sparkle animation background */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        <div className="relative flex items-center space-x-2">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={primaryCondition.trim() ? { rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Wand2 className="w-4 h-4" />
              </motion.div>
              <span>Magic Wand</span>
              <Sparkles className="w-3 h-3 opacity-70" />
            </>
          )}
        </div>

        {/* Tooltip-like hint */}
        {!primaryCondition.trim() && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Enter condition first
          </div>
        )}
      </Button>
    </motion.div>
  );
};

export default MagicWandButton;