"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTestStore } from "@/lib/store/test";
import type { OptionKey, Question, QuestionFlagStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TestQuestionProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  questionNumber: number;
  onPersistAnswer: (
    questionId: number,
    option: OptionKey | null,
    status: QuestionFlagStatus,
  ) => Promise<void> | void;
}

export default function TestQuestion({
  question,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
  questionNumber,
  onPersistAnswer,
}: TestQuestionProps) {
  const [mounted, setMounted] = useState(false);
  const setAnswer = useTestStore((state) => state.setAnswer);
  const getAnswer = useTestStore((state) => state.getAnswer);
  const toggleDoubtful = useTestStore((state) => state.toggleDoubtful);

  const currentAnswerData = getAnswer(question.id);
  const selectedAnswer = currentAnswerData?.answer || null;
  const isDoubtful = currentAnswerData?.status === "doubtful";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectAnswer = async (option: OptionKey) => {
    const isClearing = selectedAnswer === option;
    const nextOption = isClearing ? null : option;
    const status: QuestionFlagStatus = isClearing
      ? "empty"
      : isDoubtful
        ? "doubtful"
        : "answered";

    setAnswer(question.id, nextOption, status);
    await onPersistAnswer(question.id, nextOption, status);
  };

  const handleToggleDoubtful = async () => {
    toggleDoubtful(question.id);
    const next = getAnswer(question.id);
    const status = next?.status ?? "doubtful";
    await onPersistAnswer(question.id, next?.answer ?? null, status);
  };

  if (!mounted) {
    return (
      <div className="h-125 w-full flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold tracking-wider">
              SOAL {questionNumber}
            </span>
          </div>

          <Button
            disabled={!selectedAnswer}
            variant="outline"
            size="sm"
            onClick={handleToggleDoubtful}
            className={cn(
              "h-9 gap-2 font-bold transition-all border-2",
              isDoubtful
                ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                : "text-slate-500 hover:bg-white border-slate-200 hover:border-amber-500 hover:text-amber-600",
            )}
          >
            <HelpCircle size={18} />
            {isDoubtful ? "Ragu-Ragu" : "Tandai Ragu"}
          </Button>
        </div>

        <div className="whitespace-pre-line rounded-2xl border-2 border-slate-100 bg-white p-6 text-lg leading-relaxed text-slate-800 shadow-sm md:p-8">
          {question.question}
        </div>

        {question.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src={question.imageUrl}
              alt={`Ilustrasi soal ${questionNumber}`}
              className="max-h-[420px] w-full rounded-xl object-contain bg-slate-50"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(["a", "b", "c", "d", "e"] as const).map((option) => {
          const isActive = selectedAnswer === option;

          return (
            <button
              key={option}
              onClick={() => handleSelectAnswer(option)}
              className={cn(
                "group cursor-pointer relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                isActive
                  ? isDoubtful
                    ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-200"
                    : "border-primary-600 bg-primary-50/30 ring-2 ring-primary-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm transition-colors shrink-0",
                  isActive
                    ? isDoubtful
                      ? "bg-amber-500 text-white"
                      : "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                )}
              >
                {option.toUpperCase()}
              </div>

              <span
                className={cn(
                  "flex-1 whitespace-pre-line font-medium text-base",
                  isActive ? "text-slate-900" : "text-slate-600",
                )}
              >
                {question.options[option]}
              </span>

              {isActive && (
                <div
                  className={cn(
                    "shrink-0",
                    isDoubtful ? "text-amber-600" : "text-primary-600",
                  )}
                >
                  {isDoubtful ? (
                    <HelpCircle size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-6 mt-4 border-t border-slate-100">
        <Button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          variant="ghost"
          className="flex-1 h-12 font-bold text-slate-500"
        >
          <ChevronLeft className="mr-2" size={20} />
          Sebelumnya
        </Button>

        <Button
          onClick={onNext}
          className={cn(
            "flex-1 h-12 font-bold text-white shadow-lg transition-transform active:scale-95",
            isLastQuestion
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-slate-900 hover:bg-slate-800",
          )}
        >
          {isLastQuestion ? "Selesaikan Ujian" : "Soal Berikutnya"}
          {!isLastQuestion && <ChevronRight className="ml-2" size={20} />}
        </Button>
      </div>
    </div>
  );
}
