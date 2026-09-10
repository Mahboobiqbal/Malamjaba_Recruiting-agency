import React from "react";
import { Link } from "react-router-dom";
import { useGetDashboardQuery } from "../services/dashboard.service";
import { formatCurrency } from "../lib/utils";
import {
  Users,
  UserPlus,
  Stethoscope,
  Clock,
  CheckCircle,
  Plane,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Plus,
  Banknote,
  ArrowRight,
  FileText,
  CircleDot,
} from "lucide-react";

function PipelineCard({ title, count, icon: Icon, color, link, subtitle }: {
  title: string; count: number; icon: any; color: string; link: string; subtitle?: string;
}) {
  return (
    <Link to={link} className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">{count}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function MoneyCard({ title, amount, icon: Icon, color, bgColor, link }: {
  title: string; amount: number; icon: any; color: string; bgColor: string; link?: string;
}) {
  const content = (
    <div className="flex items-center gap-4">
      <div className={`rounded-xl p-3 ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
      </div>
      {link && <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
        {content}
      </Link>
    );
  }
  return (
    <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
      {content}
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

  const s = data || {
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
    total_agent_commission: 0,
    net_amount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here is what is happening in your agency today</p>
        </div>
        <div className="flex gap-3">
          <Link to="/candidates/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Candidate
          </Link>
          <Link to="/payments/new" className="flex items-center gap-2 rounded-lg border border-primary text-primary px-4 py-2.5 text-sm font-medium hover:bg-primary/5">
            <Banknote className="h-4 w-4" /> Record Payment
          </Link>
        </div>
      </div>

      {/* Pipeline — Visual flow of candidates */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Candidate Pipeline</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Click any card to see details</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <PipelineCard
            title="New Applicants"
            count={s.new_candidates}
            icon={UserPlus}
            color="bg-blue-500"
            link="/candidates?status=new"
            subtitle="Waiting to be processed"
          />
          <PipelineCard
            title="Medical Check Pending"
            count={s.medical_pending}
            icon={Stethoscope}
            color="bg-amber-500"
            link="/medical-tokens?medical_status=pending"
            subtitle="Need medical examination"
          />
          <PipelineCard
            title="Visa In Process"
            count={s.visa_processing}
            icon={Clock}
            color="bg-orange-500"
            link="/visas?status=processing"
            subtitle="Waiting for approval"
          />
          <PipelineCard
            title="Tickets Booked"
            count={s.tickets_booked}
            icon={Plane}
            color="bg-emerald-500"
            link="/tickets?status=confirmed"
            subtitle="Ready to travel"
          />
        </div>
      </div>

      {/* Completed Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Medical Completed</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.medical_completed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Visa Approved</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.visa_approved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
              <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Candidates</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.total_candidates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Money Overview */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Money Overview</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MoneyCard
            title="Received Today"
            amount={s.today_payments}
            icon={DollarSign}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
            link="/payments"
          />
          <MoneyCard
            title="Total Received"
            amount={s.total_received}
            icon={TrendingUp}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
            link="/payments"
          />
          <MoneyCard
            title="Total Spent"
            amount={s.total_expenses}
            icon={TrendingDown}
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
            link="/expenses"
          />
          <MoneyCard
            title="Agent Commission Owed"
            amount={s.total_agent_commission}
            icon={Users}
            color="text-purple-600 dark:text-purple-400"
            bgColor="bg-purple-100 dark:bg-purple-900/30"
            link="/agents"
          />
          <div className="block rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${s.outstanding_balances > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
                <AlertCircle className={`h-6 w-6 ${s.outstanding_balances > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Money Owed to Us</p>
                <p className={`text-2xl font-bold ${s.outstanding_balances > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {formatCurrency(s.outstanding_balances)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Profit — Big clear display */}
      <div className={`rounded-lg border p-5 shadow-sm dark:shadow-none ${
        s.net_amount >= 0
          ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
          : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-xl p-3 ${
              s.net_amount >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"
            }`}>
              {s.net_amount >= 0
                ? <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                : <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {s.net_amount >= 0 ? "Net Profit (After All Deductions)" : "Net Loss (After All Deductions)"}
              </p>
              <p className={`text-3xl font-bold ${
                s.net_amount >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
              }`}>
                {s.net_amount >= 0 ? "+" : ""}{formatCurrency(s.net_amount)}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Received: {formatCurrency(s.total_received)}</span>
                <span>- Expenses: {formatCurrency(s.total_expenses)}</span>
                {s.total_agent_commission > 0 && (
                  <span className="text-purple-600 dark:text-purple-400">- Commission: {formatCurrency(s.total_agent_commission)}</span>
                )}
              </div>
            </div>
          </div>
          <Link to="/reports" className="text-sm font-medium text-primary hover:underline">
            View Reports
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "All Candidates", icon: Users, link: "/candidates" },
            { label: "Payments", icon: Banknote, link: "/payments" },
            { label: "Expenses", icon: FileText, link: "/expenses" },
            { label: "Agents", icon: CircleDot, link: "/agents" },
          ].map((item) => (
            <Link key={item.label} to={item.link}
              className="flex items-center gap-3 rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
