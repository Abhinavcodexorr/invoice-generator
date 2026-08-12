import { BrandLogo } from "@/components/layout/BrandLogo";
import { Spinner } from "@/components/ui/Spinner";

export function PageLoader({
  label = "Loading…",
  fullScreen = true,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`page-loader ${fullScreen ? "page-loader--full" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loader__card animate-pop">
        <BrandLogo size={44} />
        <Spinner size={32} />
        <p className="page-loader__label">{label}</p>
      </div>
    </div>
  );
}
