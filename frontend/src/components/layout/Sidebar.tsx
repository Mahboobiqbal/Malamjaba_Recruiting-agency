import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Stamp,
  Plane,
  CreditCard,
  Receipt,
  FileText,
  Settings,
  BarChart3,
  Banknote,
  Shield,
  X,
  Building2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useMobileSidebar } from "../../context/MobileSidebarContext";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/candidates", icon: Users, label: "Candidates", permission: "candidates.view" },
  { to: "/agents", icon: UserCheck, label: "Agents", permission: "agents.view" },
  { to: "/medical", icon: Stethoscope, label: "Medical Tokens", permission: "medical.view" },
  { to: "/visas", icon: Stamp, label: "Visas", permission: "visa.view" },
  { to: "/tickets", icon: Plane, label: "Tickets", permission: "tickets.view" },
  { to: "/payments", icon: CreditCard, label: "Payments", permission: "payments.view" },
  { to: "/expenses", icon: Receipt, label: "Expenses", permission: "expenses.view" },
  { to: "/vendors", icon: Building2, label: "Vendors", permission: "vendors.view" },
  { to: "/salaries", icon: Banknote, label: "Salary", permission: "expenses.view" },
  { to: "/ledger", icon: FileText, label: "Ledger", permission: "candidates.view" },
  { to: "/reports", icon: BarChart3, label: "Reports", permission: "reports.view" },
  { to: "/users", icon: Shield, label: "Users", permission: "users.view" },
  { to: "/settings", icon: Settings, label: "Settings", permission: "settings.view" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const isSuperAdmin = permissions.includes("super_admin");

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return isSuperAdmin || permissions.includes(item.permission);
  });

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Malamjaba</span>
            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">Recruiting Agency</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onNavClick} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-3">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function Sidebar() {
  const { open, setOpen } = useMobileSidebar();

  return (
    <>
      {/* Desktop — fixed sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile — overlay drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden overflow-y-auto">
            <SidebarContent onNavClick={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
