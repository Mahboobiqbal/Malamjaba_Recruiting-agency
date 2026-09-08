import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAgentDetailsQuery, useDeleteAgentMutation, useUpdateAgentStatusMutation } from "../../services/agent.service";
import { AGENT_STATUSES } from "../../lib/constants";
import { ArrowLeft, Edit, Trash2, Users, Stethoscope, FileText, Plane, DollarSign } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";

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

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!agent) return <div className="text-center py-8 text-slate-500">Agent not found</div>;

  const stats = agent.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/agents" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{agent.name}</h2>
            <p className="text-sm text-slate-500">{agent.agent_code}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/agents/${agent.id}/edit`} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button onClick={async () => { if (window.confirm("Delete?")) { await deleteAgent(agent.id); } }}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Father Name</dt><dd className="font-medium">{agent.father_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">CNIC</dt><dd className="font-medium">{agent.cnic}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Commission Rate</dt><dd className="font-medium">{agent.commission_rate}%</dd></div>
            <div className="flex justify-between items-center"><dt className="text-slate-500">Status</dt><dd>
              <StatusDropdown value={agent.status} options={AGENT_STATUSES} onChange={(status) => updateStatus({ id: agent.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Contact Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Mobile</dt><dd className="font-medium">{agent.mobile}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">WhatsApp</dt><dd className="font-medium">{agent.whatsapp || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{agent.email || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">City</dt><dd className="font-medium">{agent.city || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Address</dt><dd className="font-medium">{agent.address || "-"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Candidates", value: stats.total_candidates || 0, color: "bg-blue-50 text-blue-700" },
          { label: "Medical", value: stats.total_medical || 0, color: "bg-purple-50 text-purple-700" },
          { label: "Visas", value: stats.total_visas || 0, color: "bg-emerald-50 text-emerald-700" },
          { label: "Tickets", value: stats.total_tickets || 0, color: "bg-amber-50 text-amber-700" },
          { label: "Payments", value: stats.total_payments || 0, color: "bg-cyan-50 text-cyan-700" },
          { label: "Total Paid", value: `PKR ${(stats.total_paid || 0).toLocaleString()}`, color: "bg-rose-50 text-rose-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-75">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex border-b border-slate-200">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-b-2 border-primary text-primary"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {(agent as any)[key === "candidates" ? "candidates" : key === "medical" ? "medical_tokens" : key]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "candidates" && (
            <CandidatesTab candidates={agent.candidates} />
          )}
          {activeTab === "medical" && (
            <ModuleTab items={agent.medical_tokens} columns={["Code", "Candidate", "Status", "Fee", "Date"]} />
          )}
          {activeTab === "visas" && (
            <ModuleTab items={agent.visas} columns={["Code", "Candidate", "Status", "Cost", "Date"]} />
          )}
          {activeTab === "tickets" && (
            <ModuleTab items={agent.tickets} columns={["Code", "Candidate", "Status", "Total", "Date"]} />
          )}
          {activeTab === "payments" && (
            <ModuleTab items={agent.payments} columns={["Code", "Candidate", "Type", "Amount", "Date"]} />
          )}
        </div>
      </div>

      {agent.notes && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-slate-800">Notes</h3>
          <p className="text-sm text-slate-600">{agent.notes}</p>
        </div>
      )}
    </div>
  );
}

function CandidatesTab({ candidates }: { candidates: any[] }) {
  if (!candidates.length) {
    return <p className="py-8 text-center text-sm text-slate-400">No candidates found for this agent.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500">
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
            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-primary">
                <Link to={`/candidates/${c.id}`}>{c.candidate_code}</Link>
              </td>
              <td className="px-4 py-3">{c.full_name}</td>
              <td className="px-4 py-3 text-slate-500">{c.passport_number}</td>
              <td className="px-4 py-3 text-slate-500">{c.mobile}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 capitalize">{c.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-500">{c.registration_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModuleTab({ items, columns }: { items: any[]; columns: string[] }) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-slate-400">No records found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-primary">{item.code}</td>
              <td className="px-4 py-3">{item.candidate_name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 capitalize">{item.status}</span>
              </td>
              <td className="px-4 py-3">PKR {(item.amount || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-slate-500">{item.date || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
