import { PadlockIcon } from "../icons";

export const ChildLockView = () => (
  <div className="h-full flex items-center justify-center gap-3 font-pixel">
    <PadlockIcon size={28} />
    <div className="flex flex-col">
      <span className="text-[16px] leading-none">CHILD LOCK</span>
      <span className="text-[10px] leading-none opacity-80 mt-1">
        HOLD ▲ + ▼ FOR 3s TO UNLOCK
      </span>
    </div>
  </div>
);

export const ChildLockHoldOverlay = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[hsl(var(--lcd-bg))]/85 font-pixel">
    <div className="flex flex-col items-center gap-1 px-3">
      <div className="flex items-center gap-2">
        <PixelButtonGuide label="▲" />
        <div className="h-[2px] bg-lcd-pixel" style={{ width: 50 * progress + 6 }} />
        <PixelButtonGuide label="▼" />
      </div>
      <span className="text-[11px] mt-1">HOLDING... {Math.round(progress * 100)}%</span>
    </div>
  </div>
);

const PixelButtonGuide = ({ label }: { label: string }) => (
  <div className="border-2 border-lcd-pixel px-2 py-0.5 text-[12px] lcd-flash">{label}</div>
);

export const BootView = ({ progress }: { progress: number }) => (
  <div className="h-full flex flex-col items-center justify-center font-pixel gap-0.5">
    <div className="flex items-start leading-none">
      <span className="text-[26px] tracking-wider">Evochef</span>
      <span className="text-[9px] mt-0.5 ml-0.5">®</span>
    </div>
    <span className="text-[10px] opacity-80">Connecting to Evochef Office...</span>
    <div className="w-[55%] h-1.5 border border-lcd-pixel mt-1">
      <div className="h-full bg-lcd-pixel" style={{ width: `${progress}%` }} />
    </div>
    <span className="text-[9px] opacity-70 mt-0.5">FW v3.0 · 140×40 mm</span>
  </div>
);
