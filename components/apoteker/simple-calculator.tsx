"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleInput = (value: string) => {
    const isOperator = ["+", "-", "*", "/", "^"].includes(value);

    if (result !== null && !isOperator) {
      setExpression(value);
      setResult(null);
    } else {
      setResult(null);
      const lastChar = expression.slice(-1);
      const operators = ["+", "-", "*", "/", "^"];
      if (operators.includes(value) && operators.includes(lastChar)) {
        setExpression(expression.slice(0, -1) + value);
      } else {
        setExpression(expression === "0" ? value : expression + value);
      }
    }
  };

  const handleClear = () => {
    setExpression("");
    setResult(null);
  };

  const handleBackspace = () => {
    if (result !== null) {
      setResult(null);
    } else {
      setExpression(expression.slice(0, -1));
    }
  };

  const handleEquals = () => {
    try {
      if (!expression) return;

      let formula = expression
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/π/g, "Math.PI")
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "Math.sin((Math.PI/180)*")
        .replace(/cos\(/g, "Math.cos((Math.PI/180)*")
        .replace(/tan\(/g, "Math.tan((Math.PI/180)*")
        .replace(/log\(/g, "Math.log10(");

      const openBrackets = (formula.match(/\(/g) || []).length;
      const closeBrackets = (formula.match(/\)/g) || []).length;
      if (openBrackets > closeBrackets) {
        formula += ")".repeat(openBrackets - closeBrackets);
      }

      const calculated = new Function(`return ${formula}`)();

      const finalResult = Number.isInteger(calculated)
        ? String(calculated)
        : parseFloat(calculated.toFixed(6)).toString();

      setResult(finalResult);
      setExpression(finalResult);
    } catch (error) {
      setResult("Error");
    }
  };

  // Button Styles
  const btnSci =
    "bg-white/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold h-9 border-none shadow-sm backdrop-blur-md";
  const btnNum =
    "bg-white/5 hover:bg-white/10 text-slate-200 text-lg h-11 border border-white/5 shadow-sm transition-all duration-200";
  const btnOp =
    "bg-blue-600/90 hover:bg-blue-500 text-white text-xl font-medium h-11 shadow-lg shadow-blue-900/20";

  return (
    <div className="bg-[#0f172a] p-5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 w-full max-w-[320px] mx-auto backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

      {/* DISPLAY AREA */}
      <div className="relative z-10 bg-black/20 rounded-2xl p-4 mb-5 border border-white/5 shadow-inner backdrop-blur-sm">
        <div className="text-blue-400/60 text-[10px] font-medium h-4 overflow-hidden text-right uppercase tracking-[0.2em]">
          {result !== null ? "Calculated" : expression ? "Input Mode" : "Sci"}
        </div>
        <div className="text-right  text-3xl font-light text-white overflow-hidden text-ellipsis whitespace-nowrap mt-1">
          {result !== null ? result : expression || "0"}
        </div>
      </div>

      {/* BUTTON GRID */}
      <div className="grid grid-cols-4 gap-2 relative z-10">
        {/* Row 1: Trig Dasar */}
        <Button onClick={() => handleInput("sin(")} className={cn(btnSci)}>
          SIN
        </Button>
        <Button onClick={() => handleInput("cos(")} className={cn(btnSci)}>
          COS
        </Button>
        <Button onClick={() => handleInput("tan(")} className={cn(btnSci)}>
          TAN
        </Button>
        <Button
          onClick={handleClear}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs h-9 border-none shadow-sm backdrop-blur-md"
        >
          AC
        </Button>

        {/* Row 2: Sci Functions */}
        <Button onClick={() => handleInput("√(")} className={cn(btnSci)}>
          √
        </Button>
        <Button onClick={() => handleInput("^")} className={cn(btnSci)}>
          xʸ
        </Button>
        <Button onClick={() => handleInput("log(")} className={cn(btnSci)}>
          LOG
        </Button>
        <Button
          onClick={() => handleInput("/")}
          className={cn(btnOp, "h-9 bg-indigo-600/90 hover:bg-indigo-500")}
        >
          ÷
        </Button>

        {/* Row 3: Numbers & Op */}
        {[7, 8, 9].map((n) => (
          <Button
            key={n}
            onClick={() => handleInput(String(n))}
            className={cn(btnNum)}
          >
            {n}
          </Button>
        ))}
        <Button
          onClick={() => handleInput("*")}
          className={cn(btnOp, "bg-indigo-600/90 hover:bg-indigo-500")}
        >
          ×
        </Button>

        {/* Row 4: Numbers & Op */}
        {[4, 5, 6].map((n) => (
          <Button
            key={n}
            onClick={() => handleInput(String(n))}
            className={cn(btnNum)}
          >
            {n}
          </Button>
        ))}
        <Button
          onClick={() => handleInput("-")}
          className={cn(btnOp, "bg-indigo-600/90 hover:bg-indigo-500")}
        >
          −
        </Button>

        {/* Row 5: Numbers & Op */}
        {[1, 2, 3].map((n) => (
          <Button
            key={n}
            onClick={() => handleInput(String(n))}
            className={cn(btnNum)}
          >
            {n}
          </Button>
        ))}
        <Button
          onClick={() => handleInput("+")}
          className={cn(btnOp, "bg-indigo-600/90 hover:bg-indigo-500")}
        >
          +
        </Button>

        {/* Row 6: Bottom */}
        <Button onClick={() => handleInput("0")} className={cn(btnNum)}>
          0
        </Button>
        <Button onClick={() => handleInput(".")} className={cn(btnNum)}>
          .
        </Button>
        <Button
          onClick={handleBackspace}
          className="bg-white/5 hover:bg-white/10 text-white h-11 border border-white/5 shadow-sm"
        >
          <Delete size={18} />
        </Button>
        <Button
          onClick={handleEquals}
          className="bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-2xl shadow-lg shadow-emerald-900/40 h-11 border-none"
        >
          =
        </Button>
      </div>

      <div className="flex flex-col items-center mt-5 space-y-1">
        <div className="w-12 h-[2px] bg-white/10 rounded-full" />
        <p className="text-[7px] text-slate-500 font-bold tracking-[0.3em] uppercase">
          Scientific Engine Active
        </p>
      </div>
    </div>
  );
}
