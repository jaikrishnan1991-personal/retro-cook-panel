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
  onPress,
  onDown,
}: {
  id: ButtonId;
  label: React.ReactNode;
  className?: string;
  shape?: "rounded" | "circle";
  onPress: (b: ButtonId) => void;
  onDown: (b: ButtonId, d: boolean) => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={id}
      onPointerDown={(e) => {
        e.preventDefault();
        ref.current?.setAttribute("data-pressed", "true");
        onDown(id, true);
        onPress(id);
      }}
      onPointerUp={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      onPointerLeave={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      onPointerCancel={() => { ref.current?.removeAttribute("data-pressed"); onDown(id, false); }}
      className={`hw-button text-hw-label font-pixel text-[10px] uppercase select-none ${
        shape === "circle" ? "rounded-full" : "rounded-md"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export const HardwareButtons = ({ onPress, onDown }: Props) => {
  // Keyboard support
  useEffect(() => {
    const downSet = new Set<ButtonId>();
    const map: Record<string, ButtonId> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      Enter: "SELECT",
      " ": "SELECT",
      Escape: "BACK",
      Backspace: "BACK",
      s: "START",
      S: "START",
      p: "PAUSE",
      P: "PAUSE",
      q: "POWER",
      Q: "POWER",
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
    <>
      {/* LEFT cluster: Power TL, Back BL, Start TR, Pause BR */}
      <div className="grid grid-cols-2 gap-1.5 w-[80px]">
        <Btn id="POWER" label="⏻" className="h-[26px]" onPress={onPress} onDown={onDown} />
        <Btn id="START" label="▶" className="h-[26px] !bg-[hsl(var(--lcd-bg))]/0" onPress={onPress} onDown={onDown} />
        <Btn id="BACK" label="◀ BACK" className="h-[26px]" onPress={onPress} onDown={onDown} />
        <Btn id="PAUSE" label="❚❚" className="h-[26px]" onPress={onPress} onDown={onDown} />
      </div>
    </>
  );
};

export const RightDPad = ({ onPress, onDown }: Props) => (
  <div className="relative w-[64px] h-[64px]">
    {/* outer ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(var(--hw-fascia-2))] to-[hsl(var(--hw-fascia))] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]" />
    {/* up */}
    <Btn id="UP" label="▲" shape="rounded" className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 !rounded-t-full"
      onPress={onPress} onDown={onDown} />
    <Btn id="DOWN" label="▼" shape="rounded" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 !rounded-b-full"
      onPress={onPress} onDown={onDown} />
    <Btn id="LEFT" label="◀" shape="rounded" className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 !rounded-l-full"
      onPress={onPress} onDown={onDown} />
    <Btn id="RIGHT" label="▶" shape="rounded" className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 !rounded-r-full"
      onPress={onPress} onDown={onDown} />
    <Btn id="SELECT" label="OK" shape="circle" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[9px]"
      onPress={onPress} onDown={onDown} />
  </div>
);
