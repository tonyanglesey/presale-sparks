"use client";

import { useEffect, useState } from "react";
import { PRESALE_END, PRESALE_START } from "@/config/sprks";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function Pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const now = new Date();
  const target = now < PRESALE_START ? PRESALE_START : PRESALE_END;
  const label = now < PRESALE_START ? "Presale starts in" : "Presale ends in";

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(
      () => setTimeLeft(calcTimeLeft(target)),
      1_000
    );
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { value: timeLeft.days, label: "days" },
    { value: timeLeft.hours, label: "hrs" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  const allZero = Object.values(timeLeft).every((v) => v === 0);
  if (allZero && now > PRESALE_END) {
    return (
      <p className="text-center text-sm font-semibold" style={{ color: "#68ff03" }}>
        Presale has ended — claims are open
      </p>
    );
  }

  return (
    <div>
      <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-3">
        {label}
      </p>
      <div className="flex gap-2 justify-center">
        {units.map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl px-3 py-2 min-w-[56px]"
            style={{ background: "rgba(94, 189, 234, 0.08)", border: "1px solid rgba(94, 189, 234, 0.2)" }}
          >
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: "white" }}
            >
              {Pad(value)}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
