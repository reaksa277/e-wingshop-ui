"use client";

import { cn } from "@/lib/utils";

interface CategoryPillProps {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function CategoryPill({
  id,
  label,
  icon,
  isActive,
  onClick,
  className,
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "category-pill relative overflow-hidden",
        isActive ? "active bg-brand text-white" : "inactive",
        className
      )}
      data-category={id}
    >
      {/* Slide-in background effect */}
      <span
        className={cn(
          "absolute inset-0 bg-brand transition-transform duration-300 ease-out",
          isActive ? "scale-x-100" : "scale-x-0"
        )}
        style={{ transformOrigin: "left" }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </span>
    </button>
  );
}

interface CategoryPillsProps {
  categories: Array<{ id: string; label: string; icon?: string }>;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  className?: string;
}

export function CategoryPills({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryPillsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide",
        className
      )}
    >
      <CategoryPill
        id="all"
        label="All"
        isActive={activeCategory === "all"}
        onClick={() => onCategoryChange("all")}
      />
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          id={category.id}
          label={category.label}
          icon={category.icon}
          isActive={activeCategory === category.id}
          onClick={() => onCategoryChange(category.id)}
        />
      ))}
    </div>
  );
}
