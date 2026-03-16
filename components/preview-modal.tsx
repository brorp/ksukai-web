"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react"; // Import icon close
import { cn } from "@/lib/utils";

interface ModalPreviewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
}

export function ModalPreview({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  headerExtra,
  maxWidth = "3xl",
}: ModalPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden border-none shadow-2xl h-[90vh] flex flex-col transition-all duration-300 [&>button]:hidden",
          {
            "max-w-sm!": maxWidth === "sm",
            "max-w-md!": maxWidth === "md",
            "max-w-lg!": maxWidth === "lg",
            "max-w-xl!": maxWidth === "xl",
            "max-w-2xl!": maxWidth === "2xl",
            "max-w-3xl!": maxWidth === "3xl",
            "max-w-4xl!": maxWidth === "4xl",
            "max-w-5xl!": maxWidth === "5xl",
            "max-w-6xl!": maxWidth === "6xl",
            "max-w-7xl!": maxWidth === "7xl",
            "w-[95vw] max-w-[95vw]!": maxWidth === "full",
          },
        )}
      >
        <DialogHeader className="p-5 bg-white/80 backdrop-blur-md border-b shrink-0 z-50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 text-left">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[11px] font-bold uppercase tracking-wider text-blue-600/70">
                  {description}
                </DialogDescription>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {headerExtra}
              {/* Custom Close Button - Lebih clean & tactile */}
              <button
                onClick={onClose}
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-slate-200 active:scale-90"
              >
                <X className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-800" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body - Ditambahkan gradient halus di bawah header */}
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
          <ScrollArea className="h-full w-full bg-slate-50/30">
            <div className="p-4">{children}</div>
          </ScrollArea>
        </div>
        {/* Sticky Footer - Dibuat lebih elegan */}
        {footer && (
          <DialogFooter className="px-6 py-4 bg-white border-t shrink-0 flex items-center justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
