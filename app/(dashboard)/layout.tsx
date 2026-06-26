import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LogOut, Home, User, Briefcase, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-variant text-neutral-on transition-colors">
      <Icon className="w-5 h-5" />
      <span className="font-medium text-body-sm">{label}</span>
    </Link>
  );
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!session.user.onboardingComplete) {
    redirect("/step/1");
  }

  return (
    <div className="min-h-screen flex bg-neutral-main">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-variant bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-neutral-variant">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/" icon={Home} label="Match Feed" />
          <NavLink href="/trades" icon={Briefcase} label="My Trades" />
          <NavLink href="/notifications" icon={Bell} label="Notifications" />
          <NavLink href="/profile" icon={User} label="My Profile" />
          <NavLink href="/settings" icon={Settings} label="Settings" />
        </nav>

        {/* Trade Categories Section */}
        <div className="flex-1 px-4 py-2 overflow-y-auto border-t border-neutral-variant">
          <h3 className="text-label-sm font-semibold text-neutral-variant-on uppercase tracking-wider mb-3 px-3 mt-2">
            Trade Categories
          </h3>
          <ul className="space-y-1">
            {[
              "Web Development",
              "Mobile App Dev",
              "UI/UX Design",
              "Graphic Design",
              "Copywriting",
              "Digital Marketing",
              "Video Editing",
              "Audio Production",
              "Translation",
              "Data Analysis",
              "Business Consulting",
              "Legal Advice",
              "Financial Planning",
              "Tutoring & Education",
              "Photography"
            ].map((category) => (
              <li key={category}>
                <Link 
                  href={`/?category=${encodeURIComponent(category)}`}
                  className="block px-3 py-1.5 text-body-sm text-neutral-on hover:text-primary hover:bg-primary-container/20 rounded-md transition-colors"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-neutral-variant">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-variant overflow-hidden">
              {session.user.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-variant-on">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium truncate text-neutral-on">{session.user.name}</p>
              <p className="text-label-sm text-neutral-variant-on truncate">Trust Score: {/* Ideally fetch this, but omitted for now */ 100}</p>
            </div>
          </div>
          <Link href="/api/auth/signout">
            <Button variant="outline" className="w-full justify-start text-error hover:bg-error hover:text-error-on-error border-error">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b border-neutral-variant bg-card flex items-center px-4 md:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
