"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface PasswordFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
}

export function PasswordField({
  control,
  name,
  label,
  placeholder,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className="pl-11 pr-10 h-12 bg-slate-50/70 border-slate-200 rounded-xl focus-visible:ring-[#0085D1] focus-visible:border-[#0085D1] transition-all"
                {...field}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-[10px] font-bold text-rose-500" />
        </FormItem>
      )}
    />
  );
}
