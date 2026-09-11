import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAgentDetailsQuery, useDeleteAgentMutation, useUpdateAgentStatusMutation } from "../../services/agent.service";
import { AGENT_STATUSES } from "../../lib/constants";
import { ArrowLeft, Edit, Trash2, Users, Stethoscope, FileText, Plane, DollarSign } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

const TABS = [
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "medical", label: "Medical", icon: Stethoscope },
  { key: "visas", label: "Visas", icon: FileText },
  { key: "tickets", label: "Tickets", icon: Plane },
  { key: "payments", label: "Payments", icon: DollarSign },
];

export default function AgentDetail() {
  const { id } = useParams();
  const { data: agent, isLoading } = useGetAgentDetailsQuery(Number(id));
  const [deleteAgent] = useDeleteAgentMutation();
  const [updateStatus] = useUpdateAgentStatusMutation();
  const [activeTab, setActiveTab] = useState("candidates");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!agent) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Agent not found</div>;

  const stats = agent.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/agents" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{agent.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{agent.agent_code}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/agents/${agent.id}/edit`} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button onClick={() => setDeleteId(agent.id)}
            className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-500/30 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Father Name</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.father_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">CNIC</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.cnic}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Commission Rate</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.commission_rate}%</dd></div>
            <div className="flex justify-between items-center"><dt className="text-slate-500 dark:text-slate-400">Status</dt><dd>
              <StatusDropdown value={agent.status} options={AGENT_STATUSES} onChange={(status) => updateStatus({ id: agent.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Contact Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Mobile</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.mobile}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">WhatsApp</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.whatsapp || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Email</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.email || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">City</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.city || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Address</dt><dd className="font-medium text-slate-800 dark:text-white">{agent.address || "-"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Candidates", value: stats.total_candidates || 0, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
          { label: "Medical", value: stats.total_medical || 0, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400" },
          { label: "Visas", value: stats.total_visas || 0, color: "bg-emerald-50 text-emerald-700" },
          { label: "Tickets", value: stats.total_tickets || 0, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700" },
          { label: "Total Amount", value: `PKR ${(stats.total_amount || 0).toLocaleString()}`, color: "bg-cyan-50 text-cyan-700" },
          { label: "Total Paid", value: `PKR ${(stats.total_paid || 0).toLocaleString()}`, color: "bg-emerald-50 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-75">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      {(stats.total_remaining || 0) > 0 && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Outstanding Balance</span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-400">PKR {(stats.total_remaining || 0).toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <div className="flex min-w-max border-b border-slate-200 dark:border-slate-700">
            {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-b-2 border-primary text-primary"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs">
                {(agent as any)[key === "candidates" ? "candidates" : key === "medical" ? "medical_tokens" : key]?.length || 0}
              </span>
            </button>
          ))}
        </div>
        </div>

        <div className="p-4">
          {activeTab === "candidates" && (
            <CandidatesTab candidates={agent.candidates} />
          )}
          {activeTab === "medical" && (
            <ModuleTab items={agent.medical_tokens} columns={["Code", "Candidate", "Status", "Fee", "Paid", "Remaining", "Date"]} />
          )}
          {activeTab === "visas" && (
            <ModuleTab items={agent.visas} columns={["Code", "Candidate", "Status", "Total", "Paid", "Remaining", "Date"]} />
          )}
          {activeTab === "tickets" && (
            <ModuleTab items={agent.tickets} columns={["Code", "Candidate", "Status", "Total", "Paid", "Remaining", "Date"]} />
          )}
          {activeTab === "payments" && (
            <ModuleTab items={agent.payments} columns={["Code", "Candidate", "Type", "Amount", "Date"]} />
          )}
        </div>
      </div>

      {agent.notes && (
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">Notes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{agent.notes}</p>
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Agent"
        message="Are you sure you want to delete this agent? This action cannot be undone."
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteAgent(deleteId).unwrap();
            toast.success("Agent deleted");
          } catch {
            toast.error("Failed to delete agent");
          }
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function CandidatesTab({ candidates }: { candidates: any[] }) {
  if (!candidates.length) {
    return <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No candidates found for this agent.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Passport</th>
            <th className="px-4 py-3 font-medium">Mobile</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-4 py-3 font-medium text-primary">
                <Link to={`/candidates/${c.id}`}>{c.candidate_code}</Link>
              </td>
              <td className="px-4 py-3">{c.full_name}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.passport_number}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.mobile}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 capitalize">{c.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.registration_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModuleTab({ items, columns }: { items: any[]; columns: string[] }) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No records found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 dark:text-slate-400">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-4 py-3 font-medium text-primary">{item.code}</td>
              <td className="px-4 py-3">{item.candidate_name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 capitalize">{item.status}</span>
              </td>
              <td className="px-4 py-3">PKR {(item.amount || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-emerald-600">PKR {(item.paid || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-rose-600">PKR {(item.remaining || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.date || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
