import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Share2, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  date?: string;
  onTap?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const MobileCard = ({
  title,
  subtitle,
  description,
  badge,
  badgeColor = "default",
  date,
  onTap,
  onShare,
  onEdit,
  onDelete,
  className,
  children
}: MobileCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleCardTap = () => {
    if (onTap) {
      onTap();
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn("relative", className)}
    >
      <Card 
        className={cn(
          "card-medical-hover cursor-pointer touch-manipulation",
          onTap && "active:bg-gray-50"
        )}
        onClick={handleCardTap}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <CardTitle className="text-base font-semibold text-foreground truncate">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {badge && (
                <Badge 
                  variant={badgeColor as any}
                  className="text-xs whitespace-nowrap"
                >
                  {badge}
                </Badge>
              )}
              
              {(onShare || onEdit || onDelete) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {(description || date || children) && (
          <CardContent className="pt-0">
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {description}
              </p>
            )}
            
            {children}
            
            {date && (
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Action Menu */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-12 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px]"
        >
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
                setShowActions(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowActions(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowActions(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Overlay to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
};

export default MobileCard;