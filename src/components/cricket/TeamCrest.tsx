import { useState } from "react";

type Props = {
  src?: string | null;
  abbr?: string | null;
  name?: string | null;
  className?: string;
  rounded?: boolean;
};

// Stable color from abbr/name so fallback badges look distinct
function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function TeamCrest({ src, abbr, name, className = "size-8", rounded = false }: Props) {
  const [failed, setFailed] = useState(false);
  const label = (abbr || name || "?").slice(0, 4).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} object-contain ${rounded ? "rounded-full" : ""}`}
      />
    );
  }

  const hue = hashHue(label);
  return (
    <span
      aria-label={name ?? label}
      className={`${className} inline-flex items-center justify-center ${rounded ? "rounded-full" : "rounded-md"} text-[10px] font-bold text-white ring-1 ring-white/15`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 35%), hsl(${(hue + 40) % 360} 70% 25%))`,
      }}
    >
      {label}
    </span>
  );
}

export default TeamCrest;
