import { ApplianceMode } from "@/lib/appliance-types";
import { FOOD_ICON_MAP, ThermoIcon, ClockIcon } from "../icons";

interface Props {
  mode: ApplianceMode;
  paused: boolean;
  done: boolean;
  zoneA?: { temp: number; timeSec: number };
  zoneB?: { temp: number; timeSec: number };
  remainingSecA?: number;
  remainingSecB?: number;
  liveTempA?: number;
  liveTempB?: number;
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
    const status = done ? "DONE" : paused ? "PAUSED" : "PREHEATING";
    return (
      <div className="h-full flex flex-col font-pixel px-2 py-1 relative">
        <ZoneRunRow
          modeName={mode.name}
          plateLabel="TOP PLATE"
          on={aOn}
          target={zoneA.temp}
          live={Math.round(liveTempA)}
          remaining={remainingSecA}
        />
        <div className="border-t lcd-divider my-0.5" />
        <ZoneRunRow
          modeName={mode.name}
          plateLabel="BOTTOM PLATE"
          on={bOn}
          target={zoneB.temp}
          live={Math.round(liveTempB)}
          remaining={remainingSecB}
        />
        <div className={`absolute bottom-0.5 left-0 right-0 text-center text-[9px] tracking-widest ${paused ? "lcd-flash" : "lcd-blink"}`}>
          ~ {status} ~
        </div>
      </div>
    );
  }

  // AUTO progress
  return (
    <div className="h-full grid grid-cols-[30%_70%] gap-2 px-2 py-1 font-pixel">
      <div className="flex flex-col items-center justify-center border-r lcd-divider pr-2">
        <span className="text-[20px] leading-none uppercase">{mode.name}</span>
        <Icon size={28} />
      </div>
      <div className="flex flex-col justify-center gap-2 px-1">
        <div className="flex items-center justify-between text-[16px]">
          <span className={paused ? "lcd-flash" : ""}>{done ? "READY!" : paused ? "PAUSED" : "COOKING..."}</span>
          <span className="text-[20px]">{progressPct ?? 0}%</span>
        </div>
        <div className="h-4 w-full border border-lcd-pixel relative">
          <div className={`h-full bg-lcd-pixel ${paused ? "lcd-blink" : ""}`} style={{ width: `${progressPct ?? 0}%` }} />
        </div>
        <div className="text-[10px] opacity-70 text-center tracking-widest">AUTO PROGRAM · A+B LOCKED</div>
        {done && <div className="text-center text-[12px]">✓ COMPLETE — PRESS BACK</div>}
      </div>
    </div>
  );
};

const ZoneRunRow = ({
  modeName, plateLabel, on, target, live, remaining,
}: { modeName: string; plateLabel: string; on: boolean; target: number; live: number; remaining: number }) => (
  <div className={`flex-1 grid grid-cols-[34%_8%_29%_29%] items-center gap-1 ${on ? "" : "opacity-50"}`}>
    <div className="flex flex-col leading-none">
      <span className="text-[20px] uppercase tracking-tight">{modeName}</span>
      <span className="text-[10px] opacity-80 mt-0.5">{plateLabel}</span>
      {on ? (
        <span className="text-[9px] opacity-80 mt-0.5">LIVE {live}°C ↑</span>
      ) : (
        <span className="text-[9px] opacity-80 mt-0.5">OFF</span>
      )}
    </div>
    <div className="flex justify-center">
      <ThermoIcon size={22} />
    </div>
    <div className="flex flex-col leading-none px-1">
      <span className="text-[10px] opacity-80">Temp</span>
      <span className="text-[22px] leading-none mt-0.5">{on ? `${target}°C` : "---"}</span>
    </div>
    <div className="flex flex-col leading-none px-1">
      <span className="flex items-center gap-1 text-[10px] opacity-80">
        <ClockIcon size={11} /> Time
      </span>
      <span className="text-[22px] leading-none mt-0.5">{on ? fmtTime(remaining) : "--:--"}</span>
    </div>
  </div>
);
