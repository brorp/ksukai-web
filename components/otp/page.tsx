"use client";

import React, { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Timer as TimerIcon, RefreshCcw } from "lucide-react";

type OTPFormData = {
  otp: string[];
};

interface OTPComponentProps {
  email?: string;
}

const OTPComponent = ({ email = "User" }: OTPComponentProps) => {
  const router = useRouter();
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { control, handleSubmit, watch } = useForm<OTPFormData>({
    defaultValues: {
      otp: new Array(6).fill(""),
    },
    mode: "onChange",
  });

  const otpValues = watch("otp");

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onVerify = (data: OTPFormData) => {
    const fullOtp = data.otp.join("");
    console.log("Verifikasi KS UKAI OTP:", fullOtp);
    router.push("/profile");
  };

  return (
    /* Wrapper untuk centering */
    <div className="min-h-[80vh] flex items-center justify-center w-full px-4">
      <Card className="w-full max-w-110 shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardHeader className="pt-9 pb-2 text-center">
          <div className="w-16 h-16 bg-[#0085D1]/10 text-[#0085D1] rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Verifikasi Kode
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 px-6">
            Kami telah mengirimkan 6 digit kode ke{" "}
            <span className="text-slate-900 font-semibold">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit(onVerify)} className="space-y-8">
            <div className="flex justify-center gap-2 sm:gap-3">
              {new Array(6).fill(0).map((_, index) => (
                <Controller
                  key={index}
                  name={`otp.${index}`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0085D1] focus:border-[#0085D1] transition-all duration-200"
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(val);
                        if (val && index < 5) {
                          inputRefs.current[index + 1].focus();
                        }
                      }}
                    />
                  )}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={otpValues.some((v) => v === "")}
                className="w-full h-12 text-base font-semibold bg-[#0085D1] hover:bg-[#0070B0] rounded-xl shadow-lg shadow-[#0085D1]/20 transition-all active:scale-[0.98]"
              >
                Verifikasi & Lanjutkan
              </Button>

              <div className="flex flex-col items-center gap-2">
                {timer > 0 ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <TimerIcon className="h-4 w-4" />
                    <span>
                      Kirim ulang dalam{" "}
                      <b className="text-[#0085D1]">{timer}s</b>
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    type="button"
                    className="text-[#0085D1] hover:text-[#0070B0] hover:bg-blue-50 font-bold text-sm flex items-center gap-2 transition-colors"
                    onClick={() => setTimer(59)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Kirim Ulang Kode
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPComponent;
