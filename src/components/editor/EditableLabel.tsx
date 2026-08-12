"use client";

interface EditableLabelProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EditableLabel({
  value,
  onChange,
  className = "",
}: EditableLabelProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block h-auto min-h-0 bg-transparent border-0 border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] focus:outline-none font-semibold text-[var(--muted)] leading-normal transition-colors duration-150 ${className}`}
    />
  );
}
