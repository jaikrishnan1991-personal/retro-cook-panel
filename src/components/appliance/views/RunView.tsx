import { ApplianceMode } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";

interface Props {
  mode: ApplianceMode;
  paused: boolean;
  done: boolean;
  // manual per-zone
  zoneA?: { temp: number; timeSec: number };
  zoneB?: { temp: number; timeSec: number };
  remainingSecA?: number;
  remainingSecB?: number;
  liveTempA?: number;
  liveTempB?: number;
  // auto
  progressPct?: number;
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export const RunView = ({
  mode, paused, done,
  zoneA, zoneB, remainingSecA = 0, remainingSecB = 0,
  liveTempA = 0, liveTempB = 0,
  progressPct,
}: Props) => {
  const Icon = FOOD_ICON_MAP[mode.icon];

  if (mode.kind === "MANUAL" && zoneA && zoneB) {
    const aOn = zoneA.timeSec > 0;
    const bOn = zoneB.timeSec > 0;
    return (
      <div className="h-full grid grid-cols-[26%_37%_37%] gap-1 px-1 py-0.5 font-pixel">
        <div className="flex flex-col items-center justify-center border-r border-lcd-pixel/30 pr-1">
          <Icon size={22} />
          <span className="text-[11px] leading-none mt-0.5 uppercase">{mode.name}</span>
          <span className={`text-[9px] leading-none mt-1 ${paused ? "lcd-flash" : "lcd-blink"}`}>
            {done ? "DONE" : paused ? "PAUSED" : "COOK"}
          </span>
        </div>
        <ZoneRunCol label="ZONE A" on={aOn} target={zoneA.temp} live={Math.round(liveTempA)} remaining={remainingSecA} />
        <ZoneRunCol label="ZONE B" on={bOn} target={zoneB.temp} live={Math.round(liveTempB)} remaining={remainingSecB} />
      </div>
    );
  }

  // AUTO progress
  return (
    <div className="h-full grid grid-cols-[30%_70%] gap-1 px-1 py-0.5 font-pixel">
      <div className="flex flex-col items-center justify-center border-r border-lcd-pixel/30 pr-1">
        <Icon size={24} />
        <span className="text-[11px] leading-none mt-0.5 uppercase">{mode.name}</span>
      </div>
      <div className="flex flex-col justify-center gap-1 px-1">
        <div className="flex items-center justify-between text-[12px]">
          <span className={paused ? "lcd-flash" : ""}>{done ? "READY!" : paused ? "PAUSED" : "COOKING..."}</span>
          <span>{progressPct ?? 0}%</span>
        </div>
        <div className="h-3 w-full border border-lcd-pixel relative">
          <div className={`h-full bg-lcd-pixel ${paused ? "lcd-blink" : ""}`} style={{ width: `${progressPct ?? 0}%` }} />
        </div>
        <div className="text-[9px] opacity-70 text-center">AUTO PROGRAM · A+B</div>
        {done && <div className="text-center text-[11px]">✓ COMPLETE — PRESS BACK</div>}
      </div>
    </div>
  );
};

const ZoneRunCol = ({
  label, on, target, live, remaining,
}: { label: string; on: boolean; target: number; live: number; remaining: number }) => (
  <div className={`flex flex-col items-center justify-center ${on ? "" : "opacity-50"}`}>
    <span className="text-[9px] leading-none opacity-80">{label} {on ? "" : "(OFF)"}</span>
    {on ? (
      <>
        <div className="flex items-baseline gap-1 leading-none mt-0.5">
          <span className="text-[16px]">{target}°</span>
          <span className="text-[9px] opacity-80">/ {live}° ↑</span>
        </div>
        <span className="text-[18px] leading-none mt-0.5">{fmtTime(remaining)}</span>
      </>
    ) : (
      <span className="text-[12px] mt-1">--:--</span>
    )}
  </div>
);
