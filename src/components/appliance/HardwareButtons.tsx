import { ButtonId } from "@/lib/appliance-types";
import { useEffect, useRef } from "react";

interface Props {
  onPress: (btn: ButtonId) => void;
  onDown: (btn: ButtonId, isDown: boolean) => void;
}

const Btn = ({
  id,
  label,
  className = "",
  shape = "rounded",
  title,
  onPress,
  onDown,
}: {
  id: ButtonId;
  label: React.ReactNode;
  className?: string;
  shape?: "rounded" | "circle";
  title?: string;
  onPress: (b: ButtonId) => void;
  onDown: (b: ButtonId, d: boolean) => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={title ?? id}
      title={title ?? id}
      onPointerDown={(e) => {
        e.preventDefault();
        ref.current?.setAttribute("data-pressed", "true");
        onDown(id, true);
        onPress(id);
      }}
      onPointerUp={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      onPointerLeave={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      onPointerCancel={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      className={`hw-button text-hw-label font-pixel uppercase select-none flex items-center justify-center ${
        shape === "circle" ? "rounded-full" : "rounded-md"
      } ${className}`}
    >
      {label}
    </button>
  );
};

/**
 * V3 right-side control cluster: D-pad + ON/OFF + Play/Pause + Back
 * Sized to fit alongside a 70x35mm LCD inside a 140x40mm fascia.
 * Includes keyboard support for the entire device.
 */
export const RightControlCluster = ({ onPress, onDown }: Props) => {
  useEffect(() => {
    const downSet = new Set<ButtonId>();
    const map: Record<string, ButtonId> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      Enter: "SELECT",
      " ": "PAUSE",
      Escape: "BACK",
      Backspace: "BACK",
      s: "PAUSE", S: "PAUSE",
      p: "PAUSE", P: "PAUSE",
      q: "POWER", Q: "POWER",
    };
    const kd = (e: KeyboardEvent) => {
      const b = map[e.key];
      if (!b) return;
      e.preventDefault();
      if (!downSet.has(b)) {
        downSet.add(b);
        onDown(b, true);
        onPress(b);
      }
    };
    const ku = (e: KeyboardEvent) => {
      const b = map[e.key];
      if (!b) return;
      downSet.delete(b);
      onDown(b, false);
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [onPress, onDown]);

  return (
    <div className="h-full flex items-center gap-2 pl-2">
      {/* Action column */}
      <div className="flex flex-col gap-1 h-full justify-center">
        <Btn id="POWER" label="⏻" title="ON / OFF" className="w-[28px] h-[18px] text-[11px]" onPress={onPress} onDown={onDown} />
        <Btn id="PAUSE" label="▶❚❚" title="Play / Pause" className="w-[28px] h-[18px] text-[9px]" onPress={onPress} onDown={onDown} />
        <Btn id="BACK"  label="◀"  title="Back" className="w-[28px] h-[18px] text-[11px]" onPress={onPress} onDown={onDown} />
      </div>

      {/* D-Pad cluster */}
      <div className="relative w-[68px] h-[68px]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(var(--hw-fascia-2))] to-[hsl(var(--hw-fascia))] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]" />
        <Btn id="UP"     label="▲" className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-[11px] !rounded-t-full" onPress={onPress} onDown={onDown} />
        <Btn id="DOWN"   label="▼" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-[11px] !rounded-b-full" onPress={onPress} onDown={onDown} />
        <Btn id="LEFT"   label="◀" className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[11px] !rounded-l-full" onPress={onPress} onDown={onDown} />
        <Btn id="RIGHT"  label="▶" className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[11px] !rounded-r-full" onPress={onPress} onDown={onDown} />
        <Btn id="SELECT" label="OK" shape="circle" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-[9px]" onPress={onPress} onDown={onDown} />
      </div>
    </div>
  );
};
