import { MODES } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";

interface Props {
  cursor: number;
}

/**
 * Compact horizontally-scrolling menu sized for the 2:1 (70x35mm) LCD.
 * Shows 5 items, cursor centered. The cursor item is highlighted and labeled.
 */
export const MenuView = ({ cursor }: Props) => {
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);
  const items = Array.from({ length: visibleCount }, (_, i) => {
    const idx = (cursor - half + i + MODES.length) % MODES.length;
    return { mode: MODES[idx], idx, isCursor: i === half };
  });
  const active = MODES[cursor];

  return (
    <div className="h-full flex flex-col px-1.5 py-0.5">
      <div className="flex items-center justify-between font-pixel text-[10px] leading-none">
        <span>SELECT MODE</span>
        <span className="opacity-70">{cursor + 1}/{MODES.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-5 gap-0.5 items-center">
        {items.map(({ mode, isCursor }, i) => {
          const Icon = FOOD_ICON_MAP[mode.icon];
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center h-full rounded-sm ${
                isCursor ? "bg-lcd-pixel text-[hsl(var(--lcd-bg))]" : ""
              }`}
            >
              <Icon size={14} />
              <span className="font-pixel text-[9px] leading-none mt-0.5 uppercase truncate">
                {isCursor ? "▸" : ""}{mode.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="font-pixel text-[9px] leading-none text-center opacity-80">
        {active.kind === "AUTO" ? "A+B LOCKED · OK TO SETUP" : "OK TO SETUP · ◀▶ SCROLL"}
      </div>
    </div>
  );
};
