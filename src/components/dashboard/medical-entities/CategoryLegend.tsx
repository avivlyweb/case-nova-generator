import { categoryColors, categoryLabels } from "./constants";

export const CategoryLegend = () => {
  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2">Categories:</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: categoryColors[key as keyof typeof categoryColors] }}
            />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};