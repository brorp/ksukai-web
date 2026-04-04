"use client";

import { useTestStore } from "@/lib/store/test";
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
    const activeElement = scrollRef.current?.querySelector<HTMLElement>(
      `[data-question-index="${currentQuestionIndex}"]`,
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentQuestionIndex]);

  const getStatusStyles = (index: number) => {
    const answer = answers.find((a) => a.index === index);
    const isActive = currentQuestionIndex === index;

    let baseStyles =
      "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50";

    if (answer?.status === "doubtful") {
      baseStyles =
        "border-amber-400 bg-amber-400 text-white hover:bg-amber-500 shadow-sm";
    } else if (answer?.status === "answered") {
      baseStyles =
        "border-primary-600 bg-primary-600 text-white hover:bg-primary-700 shadow-sm";
    }

    return cn(
      "relative flex aspect-square w-full items-center justify-center rounded-xl border-2 p-0 text-xs font-black transition-all duration-200",
      baseStyles,
      isActive &&
        "z-10 scale-105 border-primary-900 ring-4 ring-blue-100 shadow-md",
    );
  };

  return (
    <div
      ref={scrollRef}
      className="grid grid-cols-5 gap-2 rounded-2xl bg-slate-50/60 p-2 sm:grid-cols-6 lg:grid-cols-5"
    >
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const answer = answers.find((a) => a.index === index);

        return (
          <button
            key={index}
            type="button"
            data-question-index={index}
            onClick={() => onSelectQuestion(index)}
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
          </button>
        );
      })}
    </div>
  );
}
