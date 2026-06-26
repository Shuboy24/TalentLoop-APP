import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-main">
      <header className="h-16 flex items-center justify-center border-b border-neutral-variant bg-card">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-card border border-neutral-variant rounded-xl shadow-tl-sm p-6 sm:p-8 transition-shadow hover:shadow-tl-md">
          {children}
        </div>
      </main>
    </div>
  );
}
