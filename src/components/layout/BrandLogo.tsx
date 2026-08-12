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
  const paperId = `ig-paper-${uid}`;
  const accentId = `ig-accent-${uid}`;

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[0.75rem] shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 ${
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
            id={paperId}
            x1="18"
            y1="10"
            x2="48"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EAF6FB" />
          </linearGradient>
          <linearGradient
            id={accentId}
            x1="12"
            y1="52"
            x2="52"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C5E6F7" />
            <stop offset="0.5" stopColor="#8ECAE6" />
            <stop offset="1" stopColor="#6EB6D9" />
          </linearGradient>
        </defs>

        {/* Black mark */}
        <rect width="64" height="64" rx="16" fill="#0A0A0A" />

        {/* Soft accent glow */}
        <circle cx="48" cy="16" r="18" fill={`url(#${accentId})`} opacity="0.35" />

        {/* Invoice sheet */}
        <rect
          x="15"
          y="12"
          width="34"
          height="40"
          rx="5"
          fill={`url(#${paperId})`}
        />

        {/* Folded corner */}
        <path d="M39 12h5.5c2.5 0 4.5 2 4.5 4.5V22L39 12Z" fill={`url(#${accentId})`} />
        <path d="M39 12v8.2c0 1 0.8 1.8 1.8 1.8H49L39 12Z" fill="#D7EEF7" />

        {/* Header bar */}
        <rect
          x="20"
          y="20"
          width="18"
          height="3.2"
          rx="1.6"
          fill={`url(#${accentId})`}
        />

        {/* Line items */}
        <rect x="20" y="28" width="24" height="2.2" rx="1.1" fill="#0A0A0A" opacity="0.78" />
        <rect x="20" y="34" width="20" height="2.2" rx="1.1" fill="#0A0A0A" opacity="0.45" />
        <rect x="20" y="40" width="16" height="2.2" rx="1.1" fill="#0A0A0A" opacity="0.3" />

        {/* Total chip */}
        <rect
          x="20"
          y="45.5"
          width="14"
          height="3.6"
          rx="1.8"
          fill={`url(#${accentId})`}
        />
      </svg>
    </span>
  );
}
