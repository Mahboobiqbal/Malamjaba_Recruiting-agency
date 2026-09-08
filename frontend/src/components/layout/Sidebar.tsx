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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-300 bg-slate-950 text-white">
      <div className="flex h-16 items-center border-b border-slate-400 px-6">
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">Malamjaba</span>
          <span className="text-xs font-medium text-slate-400">Recruiting Agency</span>
        </div>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:bg-slate-600/60 hover:text-white"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}