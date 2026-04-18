import { ApplianceMode, OIL_LABELS } from "@/lib/appliance-types";
import { FOOD_ICON_MAP, PlateIcon } from "../icons";
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
  const Icon = FOOD_ICON_MAP[props.mode.icon];

  if (props.kind === "MANUAL") {
    const { zoneA, zoneB, field } = props;
    const aOn = zoneA.timeSec > 0;
    const bOn = zoneB.timeSec > 0;
    return (
      <div className="h-full grid grid-cols-[34%_33%_33%] gap-1 px-1 py-0.5 font-pixel">
        {/* Col 1: Mode context */}
        <div className="flex flex-col items-center justify-center border-r border-lcd-pixel/30 pr-1">
          <span className="text-[9px] leading-none opacity-70">MODE</span>
          <Icon size={20} />
          <span className="text-[12px] leading-none mt-0.5 uppercase">{props.mode.name}</span>
          <span className="text-[8px] leading-none mt-1 opacity-70">◀▶ FIELD · ▲▼ ADJ</span>
        </div>

        {/* Col 2: Zone A */}
        <ZoneCol
          label="ZONE A"
          on={aOn}
          temp={zoneA.temp}
          timeSec={zoneA.timeSec}
          tempActive={field === "A_TEMP"}
          timeActive={field === "A_TIME"}
        />

        {/* Col 3: Zone B */}
        <ZoneCol
          label="ZONE B"
          on={bOn}
          temp={zoneB.temp}
          timeSec={zoneB.timeSec}
          tempActive={field === "B_TEMP"}
          timeActive={field === "B_TIME"}
        />
      </div>
    );
  }

  // AUTO (Dosa/Crepe)
  const { quantity, thickness, oil, field } = props;
  return (
    <div className="h-full grid grid-cols-[30%_70%] gap-1 px-1 py-0.5 font-pixel">
      <div className="flex flex-col items-center justify-center border-r border-lcd-pixel/30 pr-1">
        <span className="text-[9px] leading-none opacity-70">MODE</span>
        <Icon size={22} />
        <span className="text-[12px] leading-none mt-0.5 uppercase">{props.mode.name}</span>
        <span className="text-[8px] leading-none mt-1 opacity-70">A+B LOCKED</span>
      </div>
      <div className="grid grid-cols-3 gap-1 items-center">
        <Param label="QTY" value={`${quantity}`} active={field === "QTY"} />
        <Param
          label="THICK"
          value={"▮".repeat(thickness) + "▯".repeat(5 - thickness)}
          active={field === "THICK"}
        />
        <Param label="OIL" value={OIL_LABELS[oil]} active={field === "OIL"} />
      </div>
    </div>
  );
};

const ZoneCol = ({
  label,
  on,
  temp,
  timeSec,
  tempActive,
  timeActive,
}: {
  label: string;
  on: boolean;
  temp: number;
  timeSec: number;
  tempActive: boolean;
  timeActive: boolean;
}) => (
  <div className={`flex flex-col items-center justify-center px-1 ${on ? "" : "opacity-60"}`}>
    <div className="flex items-center gap-1 leading-none">
      <PlateIcon size={10} active={on} />
      <span className="text-[10px]">{label}</span>
      <span className="text-[9px] opacity-70">{on ? "ON" : "OFF"}</span>
    </div>
    <div className="flex items-center gap-2 mt-0.5">
      <Param label="TEMP" value={`${temp}°`} active={tempActive} compact />
      <Param label="TIME" value={fmtTime(timeSec)} active={timeActive} compact />
    </div>
  </div>
);

const Param = ({
  label,
  value,
  active,
  compact,
}: {
  label: string;
  value: string;
  active?: boolean;
  compact?: boolean;
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center rounded-sm px-1 ${
      active ? "outline outline-1 outline-lcd-pixel" : ""
    }`}
  >
    {label && <span className="text-[9px] leading-none opacity-80">{label}</span>}
    <span className={`${compact ? "text-[13px]" : "text-[15px]"} leading-none my-0.5 ${active ? "lcd-blink" : ""}`}>
      {value}
    </span>
    <span className="text-[8px] leading-none opacity-70">{active ? "▲▼" : ""}</span>
  </div>
);
