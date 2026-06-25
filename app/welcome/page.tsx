import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-6 border-b border-neutral-variant bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">T</span>
          </div>
          <span className="text-title-medium font-bold tracking-tight text-neutral-on">TalentLoop</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-body-sm font-medium text-neutral-variant-on hover:text-primary transition-colors">
            Log in
          </Link>
          <Link href="/sign-up" className={buttonVariants()}>
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-display-large font-bold tracking-tight text-neutral-on">
            Trade Skills. Create Value. <span className="text-primary">Grow Together.</span>
          </h1>
          <p className="text-body-large text-neutral-variant-on max-w-2xl mx-auto">
            Join a community of professionals exchanging their expertise without money. Get the help you need by offering the skills you have.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "text-body-medium" })}>
              Start Trading Skills
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "text-body-medium" })}>
              Browse Directory
            </Link>
          </div>
        </section>

        <section className="py-20 bg-neutral">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-headline-medium font-bold text-center mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-variant text-center space-y-4">
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto text-title-large font-bold">1</div>
                <h3 className="text-title-medium font-semibold">Create Your Profile</h3>
                <p className="text-body-sm text-neutral-variant-on">List the skills you can offer and the expertise you need in return.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-variant text-center space-y-4">
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto text-title-large font-bold">2</div>
                <h3 className="text-title-medium font-semibold">Get Matched</h3>
                <p className="text-body-sm text-neutral-variant-on">Our intelligent algorithm finds perfect matches based on mutual needs and availability.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-variant text-center space-y-4">
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto text-title-large font-bold">3</div>
                <h3 className="text-title-medium font-semibold">Trade Skills</h3>
                <p className="text-body-sm text-neutral-variant-on">Propose a trade, agree on deliverables, and build your reputation on the platform.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-neutral-variant py-12 text-center text-body-sm text-neutral-variant-on">
        <p>&copy; {new Date().getFullYear()} TalentLoop. All rights reserved.</p>
      </footer>
    </div>
  );
}
