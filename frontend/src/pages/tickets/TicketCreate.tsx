import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateTicketMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { TICKET_STATUSES } from "../../lib/constants";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const [form, setForm] = useState({
    candidate_id: candidateId ? Number(candidateId) : 0,
    airline: "", pnr: "", ticket_number: "", flight_number: "",
    departure_airport: "", arrival_airport: "", departure_date: "", departure_time: "",
    arrival_date: "", arrival_time: "", baggage_allowance: "", ticket_class: "",
    ticket_price: 0, agent_commission: 0, other_charges: 0, status: "pending", remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({ ...form, candidate_id: Number(form.candidate_id) }).unwrap();
      navigate("/tickets");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to create ticket");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">New Ticket</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Candidate *</label>
            <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
              <option value={0}>Select Candidate</option>
              {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Airline</label>
            <input type="text" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">PNR</label>
            <input type="text" value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ticket Number</label>
            <input type="text" value={form.ticket_number} onChange={(e) => setForm({ ...form, ticket_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Flight Number</label>
            <input type="text" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Departure Airport</label>
            <input type="text" value={form.departure_airport} onChange={(e) => setForm({ ...form, departure_airport: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Arrival Airport</label>
            <input type="text" value={form.arrival_airport} onChange={(e) => setForm({ ...form, arrival_airport: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Departure Date</label>
            <input type="date" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Departure Time</label>
            <input type="time" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {TICKET_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ticket Price</label>
            <input type="number" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Agent Commission</label>
            <input type="number" value={form.agent_commission} onChange={(e) => setForm({ ...form, agent_commission: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Other Charges</label>
            <input type="number" value={form.other_charges} onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Ticket"}
          </button>
          <button type="button" onClick={() => navigate("/tickets")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
