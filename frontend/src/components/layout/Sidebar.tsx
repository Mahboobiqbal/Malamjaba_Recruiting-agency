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
  Bell,
  Banknote,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/candidates", icon: Users, label: "Candidates" },
  { to: "/agents", icon: UserCheck, label: "Agents" },
  { to: "/medical", icon: Stethoscope, label: "Medical Tokens" },
  { to: "/visas", icon: Stamp, label: "Visas" },
  { to: "/tickets", icon: Plane, label: "Tickets" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/salaries", icon: Banknote, label: "Salary" },
  { to: "/ledger", icon: FileText, label: "Ledger" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-700">
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
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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
    </aside>
  );
}
