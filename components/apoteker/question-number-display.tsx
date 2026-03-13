'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

interface QuestionNumberDisplayProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  answers: Map<number, { answer: string; status: "answered" | "doubtful" } | undefined>;
}

export default function QuestionNumberDisplay({
  totalQuestions,
  currentQuestionIndex,
  onSelectQuestion,
  answers,
}: QuestionNumberDisplayProps) {
  const getQuestionStatus = (questionNumber: number) => {
    const answer = answers.get(questionNumber);
    if (!answer) return 'empty';
    return answer.status;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-semibold text-gray-700 mb-2">Nomor Soal</p>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const status = getQuestionStatus(index + 1);
              const isActive = index === currentQuestionIndex;

              return (
                <button
                  key={index + 1}
                  onClick={() => {
                    onSelectQuestion(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`
                    min-w-10 h-10 rounded text-xs font-bold border-2 transition-all
                    ${
                      isActive
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : status === 'answered'
                          ? 'border-green-400 bg-green-100 text-green-700 hover:border-green-500'
                          : status === 'doubtful'
                            ? 'border-yellow-400 bg-yellow-100 text-yellow-700 hover:border-yellow-500'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }
                  `}
                  title={`Soal ${index + 1} - ${status}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
