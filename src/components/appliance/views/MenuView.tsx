import { MODES } from "@/lib/appliance-types";
import { FOOD_ICON_MAP } from "../icons";

interface Props {
  cursor: number;
}

export const MenuView = ({ cursor }: Props) => {
  // Show 5 items at a time, centered around cursor
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);
  const items = Array.from({ length: visibleCount }, (_, i) => {
    const idx = (cursor - half + i + MODES.length) % MODES.length;
    return { mode: MODES[idx], idx, isCursor: i === half };
  });

  return (
    <div className="h-full flex flex-col px-2 py-1">
      <div className="flex items-center justify-between font-pixel text-[14px] leading-none mb-0.5">
        <span>SELECT MODE</span>
        <span className="opacity-70">{cursor + 1}/{MODES.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-5 gap-1 items-center">
        {items.map(({ mode, isCursor }, i) => {
          const Icon = FOOD_ICON_MAP[mode.icon];
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center h-full rounded-sm ${
                isCursor ? "bg-lcd-pixel text-[hsl(var(--lcd-bg))] outline outline-1 outline-lcd-pixel" : ""
              }`}
            >
              <Icon size={18} />
              <span className="font-pixel text-[12px] leading-none mt-0.5 uppercase">
                {mode.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
