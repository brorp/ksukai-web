"use client";

import { useEffect, useState } from "react";

import { useTestStore } from "@/lib/store/test";

const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function TestTimer() {
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [mounted, setMounted] = useState(false);
  const getRemainingSeconds = useTestStore((state) => state.getRemainingSeconds);
  const startTime = useTestStore((state) => state.startTime);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !startTime) return;

    const updateClock = () => {
      setDisplayTime(formatSeconds(getRemainingSeconds()));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [mounted, startTime, getRemainingSeconds]);

  return <div className="text-center text-lg font-bold">{displayTime}</div>;
}
