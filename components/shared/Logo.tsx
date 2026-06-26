import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          {/* Left loop (Primary) */}
          <path
            d="M 12 12 C 8 4 2 8 2 12 C 2 16 8 20 12 12"
            className="stroke-primary"
            fill="none"
          />
          {/* Right loop (Secondary) */}
          <path
            d="M 12 12 C 16 20 22 16 22 12 C 22 8 16 4 12 12"
            className="stroke-secondary"
            fill="none"
          />
        </svg>
        <span className="text-title-large font-bold tracking-tight">
          <span className="text-primary">Talent</span>
          <span className="text-secondary">Loop</span>
        </span>
      </div>
      {showTagline && (
        <span className="text-label-small font-semibold tracking-[0.2em] text-neutral-variant-on mt-1 ml-10">
          EXCHANGE SKILLS. CREATE VALUE.
        </span>
      )}
    </div>
  );
}
