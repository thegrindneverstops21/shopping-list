import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}