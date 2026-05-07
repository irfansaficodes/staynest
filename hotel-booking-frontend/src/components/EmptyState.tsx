import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionLink, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mb-8 text-pretty">{description}</p>
    {(actionLabel && (actionLink || onAction)) && (
      actionLink ? (
        <Link to={actionLink}>
          <Button size="lg">{actionLabel}</Button>
        </Link>
      ) : (
        <Button size="lg" onClick={onAction}>{actionLabel}</Button>
      )
    )}
  </div>
);

export default EmptyState;
