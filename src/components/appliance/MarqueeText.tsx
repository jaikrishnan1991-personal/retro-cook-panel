interface Props {
  text: string;
  className?: string;
}

export const MarqueeText = ({ text, className = "" }: Props) => (
  <div className={`overflow-hidden w-full ${className}`}>
    <span className="marquee font-pixel text-[16px]">
      {text}  •  {text}  •
    </span>
  </div>
);
