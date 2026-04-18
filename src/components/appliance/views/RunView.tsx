import { ApplianceMode } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";

interface Props {
  mode: ApplianceMode;
  paused: boolean;
  done: boolean;
  // manual
  temp?: number;
  remainingSec?: number;
  // auto
  progressPct?: number;
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export const RunView = ({ mode, paused, done, temp, remainingSec, progressPct }: Props) => {
  const Icon = FOOD_ICON_MAP[mode.icon];
  return (
    <div className="h-full flex items-center px-2 py-1 gap-3">
      <div className="flex flex-col items-center justify-center w-[60px]">
        <Icon size={26} />
        <span className="font-pixel text-[12px] leading-none mt-0.5 uppercase">{mode.name}</span>
      </div>

      <div className="flex-1 flex flex-col font-pixel">
        {mode.kind === "MANUAL" ? (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[12px] leading-none opacity-80">TEMP</span>
              <span className="text-[22px] leading-none">{temp}°C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[12px] leading-none opacity-80">{done ? "DONE" : paused ? "PAUSED" : "REMAIN"}</span>
              <span className={`text-[26px] leading-none ${paused ? "lcd-blink" : ""}`}>
                {fmtTime(remainingSec ?? 0)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-1">
            <div className="flex items-center justify-between text-[14px]">
              <span>{done ? "READY!" : paused ? "PAUSED" : "COOKING..."}</span>
              <span>{progressPct ?? 0}%</span>
            </div>
            <div className="h-3 w-full border border-lcd-pixel relative">
              <div
                className={`h-full bg-lcd-pixel ${paused ? "lcd-blink" : ""}`}
                style={{ width: `${progressPct ?? 0}%` }}
              />
            </div>
            <div className="text-[10px] opacity-70 text-center">
              AUTO PROGRAM • {mode.name.toUpperCase()}
            </div>
          </div>
        )}
        {paused && (
          <div className="text-center font-pixel text-[14px] mt-1 lcd-flash">[ PAUSED — PRESS START ]</div>
        )}
        {done && (
          <div className="text-center font-pixel text-[14px] mt-1">✓ COMPLETE — PRESS BACK</div>
        )}
      </div>
    </div>
  );
};
