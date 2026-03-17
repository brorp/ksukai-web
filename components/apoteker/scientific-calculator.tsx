"use client";

import { useState, useEffect } from "react";
import { create, all } from "mathjs";
import { History, RotateCcw, X } from "lucide-react";

const math = create(all);

export default function KSUKAICalculator({
  showCalculator,
  setShowCalculator,
}: {
  showCalculator: boolean;
  setShowCalculator: (val: boolean) => void;
}) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastAns, setLastAns] = useState("0");

  useEffect(() => {
    const saved = localStorage.getItem("ksukai_calc_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToExpression = (val: string) => setExpression((prev) => prev + val);
  const clearAll = () => {
    setExpression("");
    setResult("");
  };
  const backspace = () => setExpression(expression.slice(0, -1));

  const handleCalculate = () => {
    try {
      if (!expression) return;
      const evalResult = math.evaluate(
        expression.replace(/×/g, "*").replace(/÷/g, "/"),
      );
      const formatted = math.format(evalResult, { precision: 10 });
      const entry = `${expression} = ${formatted}`;
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("ksukai_calc_history", JSON.stringify(newHistory));
      setLastAns(formatted.toString());
      setResult(formatted.toString());
      setExpression(formatted.toString());
    } catch (err) {
      setResult("Error");
    }
  };

  const buttons = [
    { label: "ln", cmd: "log(", color: "bg-slate-50 text-primary" },
    { label: "log", cmd: "log10(", color: "bg-slate-50 text-primary" },
    { label: "e", cmd: "exp(", color: "bg-slate-50 text-primary" },
    { label: "√", cmd: "sqrt(", color: "bg-slate-50 text-primary" },
    { label: "^", cmd: "^", color: "bg-slate-50 text-primary" },
    { label: "π", cmd: "pi", color: "bg-slate-50 text-primary" },
    { label: "sin", cmd: "sin(", color: "bg-slate-50 text-slate-500" },
    { label: "cos", cmd: "cos(", color: "bg-slate-50 text-slate-500" },
    { label: "tan", cmd: "tan(", color: "bg-slate-50 text-slate-500" },
    { label: "(", cmd: "(", color: "bg-slate-100 text-slate-600" },
    { label: ")", cmd: ")", color: "bg-slate-100 text-slate-600" },
    { label: "AC", cmd: "AC", color: "bg-rose-50 text-rose-600 font-bold" },
    { label: "7", cmd: "7" },
    { label: "8", cmd: "8" },
    { label: "9", cmd: "9" },
    { label: "÷", cmd: "÷", color: "bg-orange-50 text-orange-600" },
    { label: "Del", cmd: "DEL", color: "bg-slate-50 text-slate-500" },
    { label: "Ans", cmd: "ANS", color: "bg-slate-50 text-blue-500" },
    { label: "4", cmd: "4" },
    { label: "5", cmd: "5" },
    { label: "6", cmd: "6" },
    { label: "×", cmd: "×", color: "bg-orange-50 text-orange-600" },
    { label: "10ˣ", cmd: "10^", color: "bg-slate-50 text-slate-500" },
    { label: "exp", cmd: "e", color: "bg-slate-50 text-slate-500" },
    { label: "1", cmd: "1" },
    { label: "2", cmd: "2" },
    { label: "3", cmd: "3" },
    { label: "-", cmd: "-", color: "bg-orange-50 text-orange-600" },
    { label: "n!", cmd: "!", color: "bg-slate-50 text-slate-500" },
    { label: "%", cmd: "%", color: "bg-slate-50 text-slate-500" },
    { label: "0", cmd: "0" },
    { label: ".", cmd: "." },
    {
      label: "=",
      cmd: "=",
      color: "bg-primary text-white col-span-2 shadow-md shadow-blue-100",
    },
    { label: "+", cmd: "+", color: "bg-orange-50 text-orange-600" },
    {
      label: "deg",
      cmd: "deg",
      color: "bg-slate-50 text-[9px] text-slate-400",
    },
  ];

  const handleClick = (btn: any) => {
    if (btn.cmd === "=") handleCalculate();
    else if (btn.cmd === "AC") clearAll();
    else if (btn.cmd === "DEL") backspace();
    else if (btn.cmd === "ANS") addToExpression(lastAns);
    else addToExpression(btn.cmd);
  };

  if (!showCalculator) return null;

  return (
    <div className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
      <div
        className={`relative bg-white rounded-4xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-200/60 overflow-hidden transition-all duration-300 ${showHistory ? "w-162.5" : "w-112.5"}`}
      >
        {/* Header ala macOS */}
        <div className="bg-slate-50/80 backdrop-blur-md px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowCalculator(false)}
                className="h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors"
              />
              <div className="h-3 w-3 rounded-full bg-amber-400/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] ml-3">
              KSUKAI Sci-Engine v1.0
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg transition-all ${showHistory ? "bg-blue-50 text-primary" : "hover:bg-slate-200 text-slate-400"}`}
          >
            <History size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex bg-white h-100">
          {/* Main Calculator */}
          <div className="flex-1 flex flex-col p-5">
            <div className="bg-slate-50/50 rounded-2xl p-4 mb-5 flex flex-col justify-end text-right h-28 border border-slate-100/50">
              <div className="text-slate-400 text-sm  truncate mb-1">
                {expression || "0"}
              </div>
              <div className="text-slate-900 text-4xl font-bold  tracking-tight truncate">
                {result || "0"}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(btn)}
                  className={`h-10 rounded-xl text-[12px] font-bold transition-all active:scale-90 flex items-center justify-center
                    ${btn.color || "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-sm"} 
                    ${btn.label === "=" ? "col-span-2 text-sm" : ""}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="w-56 bg-slate-50/50 border-l border-slate-100 p-5 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  History
                </h3>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("ksukai_calc_history");
                  }}
                  className="hover:text-rose-500 text-slate-300 transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {history.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 italic">
                    <p className="text-[9px] text-slate-400">Belum ada data</p>
                  </div>
                )}
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-1"
                  >
                    <p className=" text-[10px] text-slate-400 truncate mb-1">
                      {h.split(" = ")[0]}
                    </p>
                    <p className="font-bold text-primary text-right text-xs">
                      = {h.split(" = ")[1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Handle */}
        <div className="h-5 pt-10 pb-5 bg-slate-50/50 flex justify-center items-center border-t border-slate-50">
          <div className="w-12 h-1 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
