"use client";

import Image from "next/image";

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
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[0.65rem] bg-black shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 ${
        variant === "onDark" ? "ring-1 ring-white/15" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}
