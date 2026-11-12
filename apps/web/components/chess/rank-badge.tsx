import { getRankTier } from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { cn } from "@funstranger/ui/lib/utils";

export function RankBadge({
  rating,
  showRating = true,
  className,
}: {
  rating: number;
  showRating?: boolean;
  className?: string;
}) {
  const tier = getRankTier(rating);
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", tier.badgeClass, className)}
    >
      {tier.label}
      {showRating ? ` · ${rating}` : ""}
    </Badge>
  );
}
