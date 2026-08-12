export function Spinner({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`app-spinner ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
