import type { ReactNode } from "react";

export function EmptyState({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__title">{title}</div>
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  );
}
