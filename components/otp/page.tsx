"use client";

import React, { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
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
import { authApi } from "@/lib/api/client";
import { savePendingRegistration } from "@/lib/registration-flow";

type OTPFormData = {
  otp: string[];
};

const OTP_LENGTH = 4;
const DEFAULT_TIMER_SECONDS = 60;

const OTPComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [timer, setTimer] = useState(DEFAULT_TIMER_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { control, handleSubmit, watch } = useForm<OTPFormData>({
    defaultValues: {
      otp: new Array(OTP_LENGTH).fill(""),
    },
    mode: "onChange",
  });

  const otpValues = watch("otp");

  useEffect(() => {
    if (!email) {
      router.replace("/register");
      return;
    }

    const interval = setInterval(() => {
      setTimer((currentTimer) =>
        currentTimer > 0 ? currentTimer - 1 : currentTimer,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [email, router]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onVerify = async (data: OTPFormData) => {
    setIsSubmitting(true);
    setError(null);
    const fullOtp = data.otp.join("");

    try {
      const response = await authApi.verifyEmailOtp(email, fullOtp);
      savePendingRegistration({
        registrationToken: response.registration_token,
        email: response.email,
        source: "email",
        expiresAt: response.registration_token_expires_at,
      });
      router.push("/profile");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Verifikasi OTP gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await authApi.reqEmailOtp(email);
      setTimer(
        response.retry_after_seconds > 0
          ? response.retry_after_seconds
          : DEFAULT_TIMER_SECONDS,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Gagal mengirim ulang OTP. Silakan coba lagi.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    /* Wrapper untuk centering */
    <div className="min-h-[80vh] flex items-center justify-center w-full px-4">
      <Card className="w-full max-w-110 shadow-[0_24px_60px_rgba(0,133,209,0.14)] border-slate-200/70 rounded-4xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardHeader className="pt-9 pb-2 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Verifikasi Kode
          </CardTitle>
          <CardDescription className="font-medium text-slate-500 px-6">
            Kami telah mengirimkan 4 digit kode ke{" "}
            <span className="text-slate-900 font-semibold">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit(onVerify)} className="space-y-8">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex justify-center gap-2 sm:gap-3">
              {new Array(OTP_LENGTH).fill(0).map((_, index) => (
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
                      className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(val);
                        if (val && index < OTP_LENGTH - 1) {
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
                disabled={isSubmitting || otpValues.some((v) => v === "")}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-700 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
              </Button>

              <div className="flex flex-col items-center gap-2">
                {timer > 0 ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <TimerIcon className="h-4 w-4" />
                    <span>
                      Kirim ulang dalam <b className="text-primary">{timer}s</b>
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    type="button"
                    className="text-primary hover:text-primary-700 hover:bg-blue-50 font-bold text-sm flex items-center gap-2 transition-colors"
                    disabled={isResending}
                    onClick={handleResend}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {isResending ? "Mengirim..." : "Kirim Ulang Kode"}
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
