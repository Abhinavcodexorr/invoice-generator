"use client";

import { useId } from "react";

interface BrandLogoProps {
  size?: number;
  className?: string;
  variant?: "default" | "onDark";
}

export function BrandLogo({
  size = 36,
  className = "",
  variant = "default",
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const bgId = `ig-bg-${uid}`;
  const accentId = `ig-accent-${uid}`;

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[0.7rem] shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 ${
        variant === "onDark" ? "ring-1 ring-white/15" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id={bgId}
            x1="8"
            y1="4"
            x2="56"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0A0A0A" />
            <stop offset="1" stopColor="#1F1F1F" />
          </linearGradient>
          <linearGradient
            id={accentId}
            x1="10"
            y1="52"
            x2="54"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C5E6F7" />
            <stop offset="0.55" stopColor="#8ECAE6" />
            <stop offset="1" stopColor="#6EB6D9" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
        <path
          d="M49 7c4.8 3.2 8.4 8.8 9 15.4.2 2.8-.2 5.5-1.2 8L41 11.2C43.4 9.2 46.1 7.8 49 7Z"
          fill={`url(#${accentId})`}
        />
        {/* I */}
        <rect x="15.5" y="19" width="6" height="22" rx="1.8" fill="#FFFFFF" />
        {/* G */}
        <path
          d="M46 30c0-5.6-4.2-9.6-9.8-9.6-5.7 0-10 4-10 9.8s4.3 9.8 10.2 9.8c3.1 0 5.8-1 7.6-2.9l-2.7-2.7c-1.2 1.1-2.8 1.7-4.8 1.7-3.2 0-5.5-2-5.9-5.1H46c.1-.7.2-1.3.2-2Zm-6.1-5.4c2.8 0 4.7 1.7 5.2 4.3H34.7c.6-2.6 2.5-4.3 5.2-4.3Z"
          fill="#FFFFFF"
        />
        <rect
          x="18"
          y="44.5"
          width="28"
          height="3.2"
          rx="1.6"
          fill={`url(#${accentId})`}
        />
      </svg>
    </span>
  );
}
