import React from "react";
import { Ticket } from "../../types";
import { formatCurrency } from "../../lib/utils";
import PrintHeader from "./PrintHeader";

const DEFAULT_COMPANY = {
  name: "Malamjaba Recruiting Agency",
  address: "",
  phone: "",
  email: "",
  website: "",
};

interface Props {
  ticket: Ticket;
  total?: number;
  paid?: number;
  remaining?: number;
}

export default function TicketPrintDocument({ ticket, total, paid, remaining }: Props) {
  const t = total ?? (ticket as any).total ?? 0;
  const p = paid ?? (ticket as any).paid ?? 0;
  const r = remaining ?? (ticket as any).remaining ?? 0;

  function s(v: any, fb: string = "-") {
    return v || fb;
  }

  function formatDateShort(d: any) {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return String(d);
    }
  }

  return (
    <div className="print-document">
      <PrintHeader title="FLIGHT TICKET" code={ticket.ticket_code} company={DEFAULT_COMPANY} />

      <div className="print-section" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 12, padding: "10px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Passenger</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>{ticket.candidate?.full_name || "-"}</p>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>PNR</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>{s(ticket.pnr)}</p>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
            <p style={{ margin: "2px 0 0" }}>
              <span className={`print-status ${ticket.status}`}>{s(ticket.status)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="print-section">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: "hsl(25, 30%, 45%)", color: "white", padding: "8px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
            Flight Route
          </div>
          <div style={{ display: "flex", alignItems: "center", padding: 20, gap: 20 }}>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{s(ticket.departure_airport)}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>{s(ticket.departure_time)}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{formatDateShort(ticket.departure_date)}</p>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{s(ticket.airline)}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "4px 0" }}>
                <div style={{ flex: 1, borderTop: "1px dashed #cbd5e1" }} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(25, 30%, 45%)" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <div style={{ flex: 1, borderTop: "1px dashed #cbd5e1" }} />
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{s(ticket.flight_number)}</p>
            </div>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{s(ticket.arrival_airport)}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>{s(ticket.arrival_time)}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{formatDateShort(ticket.arrival_date)}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "#e2e8f0", borderTop: "1px solid #e2e8f0" }}>
            {[
              { label: "Airline", value: s(ticket.airline) },
              { label: "Flight No", value: s(ticket.flight_number) },
              { label: "Ticket No", value: s(ticket.ticket_number) },
              { label: "Class", value: s(ticket.ticket_class) },
            ].map((f) => (
              <div key={f.label} style={{ background: "white", padding: "8px 12px" }}>
                <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>{f.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "2px 0 0" }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="print-section">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: "hsl(25, 30%, 45%)", color: "white", padding: "8px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
            Fare Summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "#fdf8f3", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "hsl(25, 30%, 45%)", textTransform: "uppercase", fontWeight: 600 }}>Total Charges</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "hsl(25, 30%, 45%)", margin: "4px 0 0" }}>{formatCurrency(t)}</p>
            </div>
            <div style={{ background: "#f0fdf4", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 600 }}>Paid</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#166534", margin: "4px 0 0" }}>{formatCurrency(p)}</p>
            </div>
            <div style={{ background: "#fffbeb", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#92400e", textTransform: "uppercase", fontWeight: 600 }}>Remaining</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#92400e", margin: "4px 0 0" }}>{formatCurrency(r)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="print-footer">
        <div className="print-signature">
          <div className="print-signature-line">
            <div className="line" />
            <p>Passenger Signature</p>
          </div>
          <div className="print-signature-line">
            <div className="line" />
            <p>Authorized Signature</p>
          </div>
          <div className="print-signature-line">
            <div className="line" />
            <p>Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
