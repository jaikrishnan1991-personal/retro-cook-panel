import { ApplianceMode } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";

interface ManualProps {
  kind: "MANUAL";
  mode: ApplianceMode;
  temp: number;
  timeSec: number;
}

interface AutoProps {
  kind: "AUTO";
  mode: ApplianceMode;
  quantity: number;
  thickness: number;
  oil: number;
}

type Props = ManualProps | AutoProps;

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export const SetupView = (props: Props) => {
  const Icon = FOOD_ICON_MAP[props.mode.icon];
  return (
    <div className="h-full flex items-stretch px-2 py-1 gap-2">
      <div className="flex flex-col items-center justify-center w-[70px] border-r border-lcd-pixel/30 pr-2">
        <Icon size={26} />
        <span className="font-pixel text-[14px] leading-none mt-1 uppercase">{props.mode.name}</span>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2 items-center font-pixel">
        {props.kind === "MANUAL" ? (
          <>
            <Param label="TEMP" value={`${props.temp}°C`} hint="◀ ▶" />
            <Param label="TIME" value={fmtTime(props.timeSec)} hint="(default)" />
            <Param label="" value="START ▶" hint="press START" emphasize />
          </>
        ) : (
          <>
            <Param label="QTY" value={`${props.quantity}`} hint="◀ ▶" />
            <Param label="THICK" value={"▮".repeat(props.thickness) + "▯".repeat(3 - props.thickness)} hint="" />
            <Param label="OIL" value={"▮".repeat(props.oil) + "▯".repeat(3 - props.oil)} hint="" />
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
  emphasize,
}: {
  label: string;
  value: string;
  hint: string;
  emphasize?: boolean;
}) => (
  <div className={`flex flex-col items-center justify-center text-center ${emphasize ? "" : ""}`}>
    {label && <span className="text-[12px] leading-none opacity-80">{label}</span>}
    <span className={`text-[18px] leading-none my-0.5 ${emphasize ? "lcd-blink" : ""}`}>{value}</span>
    <span className="text-[10px] leading-none opacity-70">{hint}</span>
  </div>
);
