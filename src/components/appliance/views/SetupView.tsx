import { ApplianceMode, OIL_LABELS } from "@/lib/appliance-types";
import { FOOD_ICON_MAP, ThermoIcon, ClockIcon } from "../icons";
import { ManualField, AutoField } from "@/hooks/useApplianceFSM";

interface ManualProps {
  kind: "MANUAL";
  mode: ApplianceMode;
  zoneA: { temp: number; timeSec: number };
  zoneB: { temp: number; timeSec: number };
  field: ManualField;
}

interface AutoProps {
  kind: "AUTO";
  mode: ApplianceMode;
  quantity: number;
  thickness: number;
  oil: number;
  field: AutoField;
}

type Props = ManualProps | AutoProps;

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export const SetupView = (props: Props) => {
  if (props.kind === "MANUAL") {
    const { mode, zoneA, zoneB, field } = props;
    const aOn = zoneA.timeSec > 0;
    const bOn = zoneB.timeSec > 0;
    return (
      <div className="h-full flex flex-col font-pixel px-2 py-1">
        <ZoneRow
          modeName={mode.name}
          plateLabel="TOP PLATE"
          on={aOn}
          temp={zoneA.temp}
          timeSec={zoneA.timeSec}
          onActive={field === "A_ON"}
          tempActive={field === "A_TEMP"}
          timeActive={field === "A_TIME"}
        />
        <div className="border-t lcd-divider my-0.5" />
        <ZoneRow
          modeName={mode.name}
          plateLabel="BOTTOM PLATE"
          on={bOn}
          temp={zoneB.temp}
          timeSec={zoneB.timeSec}
          onActive={field === "B_ON"}
          tempActive={field === "B_TEMP"}
          timeActive={field === "B_TIME"}
        />
      </div>
    );
  }

  // AUTO (Dosa/Crepe) — bigger, evenly spaced row layout
  const { mode, quantity, thickness, oil, field } = props;
  const Icon = FOOD_ICON_MAP[mode.icon];
  return (
    <div className="h-full grid grid-cols-[28%_72%] gap-2 px-2 py-1 font-pixel">
      <div className="flex flex-col items-center justify-center border-r lcd-divider pr-2">
        <span className="text-[20px] leading-none uppercase tracking-wide">{mode.name}</span>
        <Icon size={28} />
        <span className="text-[10px] leading-none mt-1 opacity-70">A + B LOCKED</span>
      </div>
      <div className="grid grid-cols-3 items-center h-full">
        <BigParam label="QTY" value={`${quantity}`} active={field === "QTY"} />
        <BigParam
          label="THICK"
          value={"▮".repeat(thickness) + "▯".repeat(5 - thickness)}
          active={field === "THICK"}
          mono
        />
        <BigParam label="OIL" value={OIL_LABELS[oil]} active={field === "OIL"} />
      </div>
    </div>
  );
};

const ZoneRow = ({
  modeName,
  plateLabel,
  on,
  temp,
  timeSec,
  onActive,
  tempActive,
  timeActive,
}: {
  modeName: string;
  plateLabel: string;
  on: boolean;
  temp: number;
  timeSec: number;
  onActive: boolean;
  tempActive: boolean;
  timeActive: boolean;
}) => (
  <div className={`flex-1 grid grid-cols-[34%_8%_29%_29%] items-center gap-1 ${on ? "" : "opacity-55"}`}>
    {/* Mode + plate label */}
    <div className="flex flex-col leading-none">
      <span className="text-[20px] uppercase tracking-tight">{modeName}</span>
      <span className="text-[10px] opacity-80 mt-0.5">{plateLabel}</span>
      <span
        className={`text-[10px] mt-0.5 lcd-chip self-start ${
          onActive ? "lcd-blink" : ""
        }`}
        title="▲▼ to toggle"
      >
        {on ? "ON" : "OFF"}
      </span>
    </div>
    {/* Thermo icon column */}
    <div className="flex justify-center">
      <ThermoIcon size={22} />
    </div>
    {/* Temp */}
    <BigField
      label="Temp"
      icon={null}
      value={on ? `${temp}°C` : "---"}
      active={tempActive}
    />
    {/* Time */}
    <BigField
      label="Time"
      icon={<ClockIcon size={11} />}
      value={on ? fmtTime(timeSec) : "--:--"}
      active={timeActive}
    />
  </div>
);

const BigField = ({
  label,
  icon,
  value,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  active?: boolean;
}) => (
  <div className={`flex flex-col leading-none px-1 ${active ? "outline outline-1 outline-lcd-pixel rounded-sm" : ""}`}>
    <span className="flex items-center gap-1 text-[10px] opacity-80">
      {icon}
      {label}
    </span>
    <span className={`text-[22px] leading-none mt-0.5 ${active ? "lcd-blink" : ""}`}>
      {value}
    </span>
  </div>
);

const BigParam = ({
  label,
  value,
  active,
  mono,
}: {
  label: string;
  value: string;
  active?: boolean;
  mono?: boolean;
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center rounded-sm px-1 py-1 ${
      active ? "outline outline-1 outline-lcd-pixel" : ""
    }`}
  >
    <span className="text-[11px] leading-none opacity-80">{label}</span>
    <span className={`${mono ? "text-[18px] tracking-widest" : "text-[22px]"} leading-none mt-1 ${active ? "lcd-blink" : ""}`}>
      {value}
    </span>
    <span className="text-[9px] leading-none opacity-70 mt-0.5">{active ? "▲▼" : ""}</span>
  </div>
);
