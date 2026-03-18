"use client";

import { useTestStore } from "@/lib/store/test";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface QuestionNumberGridProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

export default function QuestionNumberGrid({
  totalQuestions,
  currentQuestionIndex,
  onSelectQuestion,
}: QuestionNumberGridProps) {
  const answers = useTestStore((state) => state.answers);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeElement = scrollRef.current?.children[
      currentQuestionIndex
    ] as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentQuestionIndex]);

  const getStatusStyles = (index: number) => {
    const answer = answers.find((a) => a.index === index);
    const isActive = currentQuestionIndex === index;

    let baseStyles =
      "bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-primary";

    if (answer?.status === "doubtful") {
      baseStyles =
        "bg-amber-400 border-amber-500 text-white hover:bg-amber-500 shadow-sm";
    } else if (answer?.status === "answered") {
      baseStyles =
        "bg-primary-600 border-primary-700 text-white hover:bg-primary-700 shadow-sm";
    }

    return cn(
      "min-w-[40px] h-10 p-0 text-sm font-bold transition-all duration-200 border-2 rounded-lg relative",
      baseStyles,
      isActive &&
        "ring-4 ring-blue-100 border-primary-900 scale-110 z-10 shadow-md",
    );
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-3 pt-1 px-2 no-scrollbar scroll-smooth bg-slate-50/50 rounded-xl"
    >
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const answer = answers.find((a) => a.index === index);

        return (
          <Button
            key={index}
            onClick={() => onSelectQuestion(index)}
            variant="outline"
            className={getStatusStyles(index)}
          >
            {index + 1}

            {answer?.status === "answered" && !answer.answer && (
              <span className="absolute bottom-0.5 w-1 h-1 bg-white rounded-full"></span>
            )}
            {currentQuestionIndex === index && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
