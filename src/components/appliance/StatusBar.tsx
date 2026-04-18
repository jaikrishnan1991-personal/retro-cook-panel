import { WifiIcon, PadlockIcon, ZoneDot } from "./icons";
import { WifiState, Zone } from "@/lib/appliance-types";

interface Props {
  wifi: WifiState;
  locked: boolean;
  zone: Zone;
  clock?: string;
}

export const StatusBar = ({ wifi, locked, zone, clock = "12:00" }: Props) => {
  const bars = wifi === "CONNECTED" ? 3 : wifi === "ERROR" ? 1 : 2;
  return (
    <div className="flex items-center justify-between px-2 py-0.5 border-b border-lcd-pixel/40 font-pixel text-[14px] leading-none">
      <div className="flex items-center gap-2">
        <span className={wifi === "SEARCHING" ? "wifi-pulse" : ""}>
          <WifiIcon size={14} bars={bars as 0 | 1 | 2 | 3} />
        </span>
        <span className="tracking-widest">{wifi === "CONNECTED" ? "ONLINE" : wifi === "ERROR" ? "OFFLN" : "CONN.."}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[12px] mr-1">ZONE</span>
        <ZoneDot size={10} active={zone === "A" || zone === "BOTH"} />
        <span className="text-[12px]">A</span>
        <ZoneDot size={10} active={zone === "B" || zone === "BOTH"} />
        <span className="text-[12px]">B</span>
      </div>

      <div className="flex items-center gap-2">
        {locked && <PadlockIcon size={14} />}
        <span>{clock}</span>
      </div>
    </div>
  );
};
