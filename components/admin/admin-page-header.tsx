"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export default function AdminPageHeader({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionDisabled,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sky-600 mb-1">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest">
            Administrator Portal
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
