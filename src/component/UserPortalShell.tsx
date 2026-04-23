import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  BriefcaseBusiness, 
  Building2, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  UserCircle2, 
  X,
  Calendar,
  Bell,
  BarChart3,
  Search,
  FileText
} from "lucide-react";

interface UserPortalShellProps {
  children: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

interface NavItem {
  label: string;
  to: string;
  icon: any;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", to: "/my-applications", icon: BriefcaseBusiness },
  { label: "Companies", to: "/companies", icon: Building2 },
  { label: "Interviews", to: "/interviews", icon: Calendar, roles: ["employer", "jobseeker", "deployment_officer", "admin"] },
  { label: "Notifications", to: "/notifications", icon: Bell, roles: ["employer", "jobseeker", "deployment_officer", "admin"] },
  { label: "Analytics", to: "/analytics", icon: BarChart3, roles: ["admin", "employer"] },
  { label: "Screening", to: "/screening", icon: Search, roles: ["admin", "employer"] },
  { label: "Reports", to: "/reports", icon: FileText, roles: ["admin", "employer"] },
  { label: "Profile", to: "/profile", icon: UserCircle2 },
];

const isActiveRoute = (pathname: string, to: string) => pathname.toLowerCase() === to.toLowerCase();

export default function UserPortalShell({
  children,
  title,
  description,
  eyebrow = "Career hub",
  actions,
  stats = [],
}: UserPortalShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role for filtering nav items
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || "jobseeker";

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => {
    if (!item.roles) return true; // Show items without role restrictions
    return item.roles.includes(userRole);
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="portal-shell min-h-screen bg-slate-950 text-slate-900">
      <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.22),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.16),_transparent_22%),linear-gradient(180deg,_#fcfcff_0%,_#f8fafc_45%,_#f1f5f9_100%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />
        <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6rem] top-48 h-80 w-80 rounded-full bg-orange-200/25 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-sm font-black tracking-[0.2em] text-white shadow-lg shadow-violet-700/20">
                HD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">Honor Deployment</p>
                <p className="truncate text-xs text-slate-500">Career portal</p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              {navItems.map(({ label, to, icon: Icon }) => {
                const active = isActiveRoute(location.pathname, to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                        : "text-slate-600 hover:bg-white hover:text-violet-700"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 sm:inline-flex"
              >
                <LogOut size={16} className="mr-2" />
                Log out
              </button>

              <details className="group relative lg:hidden">
                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm marker:content-none">
                  <Menu size={18} className="group-open:hidden" />
                  <X size={18} className="hidden group-open:block" />
                </summary>
                <div className="absolute right-0 top-14 w-72 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
                  <div className="space-y-1">
                    {navItems.map(({ label, to, icon: Icon }) => {
                      const active = isActiveRoute(location.pathname, to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            active ? "bg-violet-600 text-white" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={17} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                  >
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </button>
                </div>
              </details>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.16),_transparent_42%),radial-gradient(circle_at_center,_rgba(139,92,246,0.12),_transparent_48%)] lg:block" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.34em] text-violet-700">{eyebrow}</p>
                <h1 className="mb-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
              </div>

              {actions && <div className="relative z-10 shrink-0">{actions}</div>}
            </div>

            {stats.length > 0 && (
              <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-slate-200/70 bg-white/80 px-5 py-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
