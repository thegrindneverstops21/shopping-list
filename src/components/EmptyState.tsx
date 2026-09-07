import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, image, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {image && <div className="empty-state-image">{image}</div>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}