import React from "react";
import { useGetDashboardQuery } from "../services/dashboard.service";
import { formatCurrency } from "../lib/utils";
import {
  Users,
  UserPlus,
  Stethoscope,
  Clock,
  Stamp,
  CheckCircle,
  Plane,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const stats = data || {
    total_candidates: 0,
    new_candidates: 0,
    medical_pending: 0,
    medical_completed: 0,
    visa_processing: 0,
    visa_approved: 0,
    tickets_booked: 0,
    pending_payments: 0,
    today_payments: 0,
    outstanding_balances: 0,
    total_received: 0,
    total_pending: 0,
    total_expenses: 0,
    net_amount: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to Malamjaba Recruiting Agency</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Candidates" value={stats.total_candidates} icon={Users} color="bg-primary" />
        <StatCard title="New Candidates" value={stats.new_candidates} icon={UserPlus} color="bg-success" />
        <StatCard title="Medical Pending" value={stats.medical_pending} icon={Stethoscope} color="bg-warning" />
        <StatCard title="Visa Processing" value={stats.visa_processing} icon={Clock} color="bg-accent" />
        <StatCard title="Visa Approved" value={stats.visa_approved} icon={CheckCircle} color="bg-success" />
        <StatCard title="Tickets Booked" value={stats.tickets_booked} icon={Plane} color="bg-accent" />
        <StatCard title="Pending Payments" value={stats.pending_payments} icon={CreditCard} color="bg-warning" />
        <StatCard title="Today's Payments" value={formatCurrency(stats.today_payments)} icon={DollarSign} color="bg-accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Received</p>
              <p className="text-xl font-bold text-success">{formatCurrency(stats.total_received)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(stats.total_expenses)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(stats.outstanding_balances)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
