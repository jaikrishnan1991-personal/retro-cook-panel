import { ApplianceMode, Zone } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";
import { ManualField, AutoField } from "@/hooks/useApplianceFSM";

interface ManualProps {
  kind: "MANUAL";
  mode: ApplianceMode;
  temp: number;
  timeSec: number;
  zone: Zone;
  field: ManualField;
}

interface AutoProps {
  kind: "AUTO";
  mode: ApplianceMode;
  quantity: number;
  thickness: number;
  oil: number;
  zone: Zone;
  field: AutoField;
}

type Props = ManualProps | AutoProps;

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const zoneLabel = (z: Zone) => (z === "BOTH" ? "A+B" : z);

export const SetupView = (props: Props) => {
  const Icon = FOOD_ICON_MAP[props.mode.icon];
  const isLockedZone = props.kind === "AUTO" && (props.mode.id === "dosa" || props.mode.id === "crepe");

  return (
    <div className="h-full flex items-stretch px-2 py-1 gap-2">
      <div className="flex flex-col items-center justify-center w-[64px] border-r border-lcd-pixel/30 pr-2">
        <Icon size={24} />
        <span className="font-pixel text-[13px] leading-none mt-1 uppercase">{props.mode.name}</span>
        <span className="font-pixel text-[9px] leading-none mt-0.5 opacity-70">▲▼ FIELD</span>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-1 items-center font-pixel">
        {props.kind === "MANUAL" ? (
          <>
            <Param label="TEMP" value={`${props.temp}°C`} active={props.field === "TEMP"} />
            <Param label="TIME" value={fmtTime(props.timeSec)} active={props.field === "TIME"} />
            <Param label="ZONE" value={zoneLabel(props.zone)} active={props.field === "ZONE"} />
            <Param label="" value="START ▶" hint="press ▶" emphasize />
          </>
        ) : (
          <>
            <Param label="QTY" value={`${props.quantity}`} active={props.field === "QTY"} />
            <Param
              label="THICK"
              value={"▮".repeat(props.thickness) + "▯".repeat(3 - props.thickness)}
              active={props.field === "THICK"}
            />
            <Param
              label="OIL"
              value={"▮".repeat(props.oil) + "▯".repeat(3 - props.oil)}
              active={props.field === "OIL"}
            />
            <Param
              label="ZONE"
              value={isLockedZone ? "A+B" : zoneLabel(props.zone)}
              active={!isLockedZone && props.field === "ZONE"}
              hint={isLockedZone ? "LOCKED" : undefined}
              dim={isLockedZone}
            />
          </>
        )}
      </div>
    </div>
  );
};

const Param = ({
  label,
  value,
  hint,
  active,
  emphasize,
  dim,
}: {
  label: string;
  value: string;
  hint?: string;
  active?: boolean;
  emphasize?: boolean;
  dim?: boolean;
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center rounded-sm px-0.5 ${
      active ? "outline outline-1 outline-lcd-pixel" : ""
    } ${dim ? "opacity-50" : ""}`}
  >
    {label && <span className="text-[11px] leading-none opacity-80">{label}</span>}
    <span
      className={`text-[16px] leading-none my-0.5 ${
        emphasize ? "lcd-blink" : active ? "lcd-blink" : ""
      }`}
    >
      {value}
    </span>
    <span className="text-[9px] leading-none opacity-70">
      {hint ?? (active ? "◀ ▶" : "")}
    </span>
  </div>
);
