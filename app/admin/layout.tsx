import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Briefcase, AlertTriangle, List, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-variant text-neutral-on transition-colors">
      <Icon className="w-5 h-5" />
      <span className="font-medium text-body-sm">{label}</span>
    </Link>
  );
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-neutral-main">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-variant bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-neutral-variant">
          <Link href="/admin" className="text-primary font-heading font-bold text-title-lg">
            TalentLoop Admin
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin" icon={LayoutDashboard} label="Overview" />
          <NavLink href="/admin/users" icon={Users} label="Users" />
          <NavLink href="/admin/trades" icon={Briefcase} label="Trades" />
          <NavLink href="/admin/disputes" icon={AlertTriangle} label="Disputes" />
          <NavLink href="/admin/skills" icon={List} label="Skills Directory" />
        </nav>

        <div className="p-4 border-t border-neutral-variant space-y-4">
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full justify-start text-neutral-variant-on">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to User App
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-neutral-variant overflow-hidden">
              {session.user.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-variant-on">
                  {session.user.name?.charAt(0) || "A"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium truncate text-neutral-on">{session.user.name}</p>
              <p className="text-label-sm text-neutral-variant-on truncate">Administrator</p>
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
          <Link href="/admin" className="text-primary font-heading font-bold text-title-md">
            TalentLoop Admin
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
