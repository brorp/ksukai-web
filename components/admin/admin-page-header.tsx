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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-50">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 text-sky-600">
          {icon}
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Administrator Portal
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-none">
            {title}
          </h1>
          <p className="text-xs font-medium text-slate-400 line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          disabled={actionDisabled}
          className="rounded-xl font-bold h-9 px-4 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
