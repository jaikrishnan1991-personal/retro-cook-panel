import { SVGProps } from "react";

/**
 * Pixel-art style SVG icons. All icons use currentColor so they inherit LCD pixel color.
 * Designed on a 16x16 grid with shape-rendering: crispEdges for that authentic dot look.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Pixel = ({ x, y, w = 1, h = 1 }: { x: number; y: number; w?: number; h?: number }) => (
  <rect x={x} y={y} width={w} height={h} fill="currentColor" />
);

const wrap = (children: React.ReactNode, { size = 16, viewBox = "0 0 16 16", ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

export const WifiIcon = ({ bars = 3, ...props }: IconProps & { bars?: 0 | 1 | 2 | 3 }) =>
  wrap(
    <>
      {/* base dot */}
      <Pixel x={7} y={13} w={2} h={2} />
      {/* arc 1 small */}
      {bars >= 1 && (
        <>
          <Pixel x={5} y={10} w={6} h={1} />
          <Pixel x={5} y={11} w={1} h={1} />
          <Pixel x={10} y={11} w={1} h={1} />
        </>
      )}
      {bars >= 2 && (
        <>
          <Pixel x={3} y={7} w={10} h={1} />
          <Pixel x={3} y={8} w={1} h={1} />
          <Pixel x={12} y={8} w={1} h={1} />
        </>
      )}
      {bars >= 3 && (
        <>
          <Pixel x={1} y={4} w={14} h={1} />
          <Pixel x={1} y={5} w={1} h={1} />
          <Pixel x={14} y={5} w={1} h={1} />
        </>
      )}
    </>,
    props,
  );

export const PadlockIcon = (props: IconProps) =>
  wrap(
    <>
      <Pixel x={5} y={2} w={6} h={1} />
      <Pixel x={4} y={3} w={1} h={4} />
      <Pixel x={11} y={3} w={1} h={4} />
      <Pixel x={5} y={6} w={1} h={1} />
      <Pixel x={10} y={6} w={1} h={1} />
      <Pixel x={3} y={7} w={10} h={7} />
      <rect x={7} y={9} width={2} height={2} fill="hsl(var(--lcd-bg))" />
      <rect x={7} y={11} width={2} height={2} fill="hsl(var(--lcd-bg))" />
    </>,
    props,
  );

export const WarningIcon = (props: IconProps) =>
  wrap(
    <>
      <Pixel x={7} y={1} w={2} h={1} />
      <Pixel x={6} y={2} w={4} h={1} />
      <Pixel x={5} y={3} w={6} h={1} />
      <Pixel x={4} y={4} w={8} h={1} />
      <Pixel x={3} y={5} w={10} h={1} />
      <Pixel x={2} y={6} w={12} h={1} />
      <Pixel x={1} y={7} w={14} h={1} />
      <Pixel x={1} y={8} w={14} h={2} />
      <Pixel x={0} y={10} w={16} h={2} />
      <rect x={7} y={5} width={2} height={4} fill="hsl(var(--lcd-bg))" />
      <rect x={7} y={10} width={2} height={1} fill="hsl(var(--lcd-bg))" />
    </>,
    props,
  );

export const ZoneDot = ({ active = false, ...props }: IconProps & { active?: boolean }) =>
  wrap(
    <>
      <rect x={2} y={2} width={12} height={12} fill="none" stroke="currentColor" strokeWidth={1} />
      {active && <Pixel x={5} y={5} w={6} h={6} />}
    </>,
    props,
  );

/* ---------- Food Icons (24x16 wider for that dot-matrix feel) ---------- */

const foodWrap = (children: React.ReactNode, { size = 24, ...props }: IconProps) => (
  <svg
    width={size * 1.5}
    height={size}
    viewBox="0 0 24 16"
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

export const DosaIcon = (props: IconProps) =>
  foodWrap(
    <>
      {/* rolled dosa cone */}
      <Pixel x={2} y={6} w={20} h={1} />
      <Pixel x={1} y={7} w={22} h={1} />
      <Pixel x={1} y={8} w={22} h={2} />
      <Pixel x={2} y={10} w={20} h={1} />
      <Pixel x={3} y={11} w={18} h={1} />
      <rect x={4} y={8} width={6} height={1} fill="hsl(var(--lcd-bg))" />
      <rect x={14} y={8} width={6} height={1} fill="hsl(var(--lcd-bg))" />
    </>,
    props,
  );

export const CrepeIcon = (props: IconProps) =>
  foodWrap(
    <>
      {/* folded crepe triangle */}
      <Pixel x={4} y={11} w={16} h={1} />
      <Pixel x={5} y={10} w={14} h={1} />
      <Pixel x={6} y={9} w={12} h={1} />
      <Pixel x={7} y={8} w={10} h={1} />
      <Pixel x={8} y={7} w={8} h={1} />
      <Pixel x={9} y={6} w={6} h={1} />
      <Pixel x={10} y={5} w={4} h={1} />
      <Pixel x={11} y={4} w={2} h={1} />
      {/* berries */}
      <Pixel x={9} y={11} w={1} h={1} />
      <Pixel x={13} y={10} w={1} h={1} />
    </>,
    props,
  );

export const SteakIcon = (props: IconProps) =>
  foodWrap(
    <>
      <Pixel x={3} y={5} w={18} h={1} />
      <Pixel x={2} y={6} w={20} h={1} />
      <Pixel x={2} y={7} w={20} h={4} />
      <Pixel x={3} y={11} w={18} h={1} />
      <Pixel x={4} y={12} w={16} h={1} />
      {/* bone */}
      <rect x={3} y={7} width={3} height={3} fill="hsl(var(--lcd-bg))" />
      <Pixel x={3} y={7} w={1} h={1} />
      <Pixel x={5} y={9} w={1} h={1} />
    </>,
    props,
  );

export const ChickenIcon = (props: IconProps) =>
  foodWrap(
    <>
      {/* drumstick */}
      <Pixel x={4} y={4} w={6} h={1} />
      <Pixel x={3} y={5} w={8} h={1} />
      <Pixel x={3} y={6} w={9} h={4} />
      <Pixel x={4} y={10} w={9} h={1} />
      <Pixel x={5} y={11} w={9} h={1} />
      {/* bone */}
      <Pixel x={13} y={9} w={6} h={1} />
      <Pixel x={13} y={10} w={6} h={1} />
      <Pixel x={19} y={8} w={2} h={2} />
      <Pixel x={19} y={11} w={2} h={2} />
    </>,
    props,
  );

export const BurgerIcon = (props: IconProps) =>
  foodWrap(
    <>
      <Pixel x={3} y={3} w={18} h={1} />
      <Pixel x={2} y={4} w={20} h={2} />
      <Pixel x={5} y={4} w={1} h={1} />
      <Pixel x={10} y={4} w={1} h={1} />
      <Pixel x={15} y={4} w={1} h={1} />
      <Pixel x={2} y={6} w={20} h={1} />
      <Pixel x={2} y={7} w={20} h={1} />
      <Pixel x={2} y={8} w={20} h={2} />
      <Pixel x={3} y={10} w={18} h={1} />
      <Pixel x={2} y={11} w={20} h={2} />
    </>,
    props,
  );

export const FishIcon = (props: IconProps) =>
  foodWrap(
    <>
      <Pixel x={4} y={6} w={14} h={4} />
      <Pixel x={5} y={5} w={12} h={1} />
      <Pixel x={5} y={10} w={12} h={1} />
      {/* tail */}
      <Pixel x={18} y={5} w={1} h={6} />
      <Pixel x={19} y={4} w={1} h={2} />
      <Pixel x={19} y={10} w={1} h={2} />
      <Pixel x={20} y={3} w={1} h={3} />
      <Pixel x={20} y={10} w={1} h={3} />
      {/* eye */}
      <rect x={6} y={7} width={1} height={1} fill="hsl(var(--lcd-bg))" />
      <Pixel x={6} y={7} w={1} h={1} />
    </>,
    props,
  );

export const SandwichIcon = (props: IconProps) =>
  foodWrap(
    <>
      <Pixel x={3} y={4} w={18} h={2} />
      <Pixel x={3} y={6} w={18} h={1} />
      <Pixel x={3} y={7} w={18} h={1} />
      <Pixel x={3} y={8} w={18} h={1} />
      <Pixel x={3} y={9} w={18} h={1} />
      <Pixel x={3} y={10} w={18} h={2} />
      <rect x={5} y={7} width={3} height={1} fill="hsl(var(--lcd-bg))" />
      <rect x={11} y={9} width={3} height={1} fill="hsl(var(--lcd-bg))" />
    </>,
    props,
  );

export const HotdogIcon = (props: IconProps) =>
  foodWrap(
    <>
      <Pixel x={2} y={5} w={20} h={6} />
      <Pixel x={1} y={6} w={1} h={4} />
      <Pixel x={22} y={6} w={1} h={4} />
      {/* sausage */}
      <rect x={3} y={6} width={18} height={4} fill="hsl(var(--lcd-bg))" />
      <Pixel x={3} y={7} w={18} h={2} />
      {/* mustard zigzag */}
      <Pixel x={4} y={7} w={2} h={1} />
      <Pixel x={8} y={8} w={2} h={1} />
      <Pixel x={12} y={7} w={2} h={1} />
      <Pixel x={16} y={8} w={2} h={1} />
    </>,
    props,
  );

export const FOOD_ICON_MAP: Record<string, (p: IconProps) => JSX.Element> = {
  dosa: DosaIcon,
  crepe: CrepeIcon,
  steak: SteakIcon,
  chicken: ChickenIcon,
  burger: BurgerIcon,
  fish: FishIcon,
  sandwich: SandwichIcon,
  hotdog: HotdogIcon,
};

/* Arrow / chevron */
export const ChevronUpPx = (props: IconProps) =>
  wrap(
    <>
      <Pixel x={7} y={4} w={2} h={1} />
      <Pixel x={6} y={5} w={4} h={1} />
      <Pixel x={5} y={6} w={6} h={1} />
      <Pixel x={4} y={7} w={8} h={1} />
    </>,
    props,
  );

export const ChevronDownPx = (props: IconProps) =>
  wrap(
    <>
      <Pixel x={4} y={8} w={8} h={1} />
      <Pixel x={5} y={9} w={6} h={1} />
      <Pixel x={6} y={10} w={4} h={1} />
      <Pixel x={7} y={11} w={2} h={1} />
    </>,
    props,
  );
