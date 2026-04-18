import { ERROR_DETAILS, ErrorCode } from "@/lib/appliance-types";
import { WarningIcon } from "../icons";
import { MarqueeText } from "../MarqueeText";

export const ErrorView = ({ code }: { code: ErrorCode }) => {
  const def = ERROR_DETAILS[code];
  return (
    <div className="h-full flex flex-col font-pixel">
      <div className="flex-1 flex items-center justify-center gap-3 px-2">
        <span className="lcd-flash">
          <WarningIcon size={32} />
        </span>
        <div className="flex flex-col">
          <span className="text-[26px] leading-none lcd-flash">{code}</span>
          <span className="text-[12px] leading-none opacity-80 mt-1">{def.title}</span>
        </div>
      </div>
      <MarqueeText text={`${code} — ${def.description}`} className="border-t border-lcd-pixel/40" />
    </div>
  );
};
