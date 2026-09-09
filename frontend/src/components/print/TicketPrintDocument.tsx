import { formatDate, formatCurrency } from "../../lib/utils";
import type { Ticket } from "../../types";

interface Props {
  ticket: Ticket;
  total?: number;
  paid?: number;
  remaining?: number;
}

export default function TicketPrintDocument({ ticket, total = 0, paid = 0, remaining = 0 }: Props) {
  const s = (v: string | undefined | null, fb = "-") => v || fb;

  return (
    <div className="print-document relative" style={{ padding: "30px 40px" }}>
      <div className="print-watermark">MALAMJABA</div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid hsl(25,30%,45%)", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, background: "hsl(25,30%,45%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "hsl(25,30%,15%)", margin: 0 }}>Malamjaba</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,45%)", textTransform: "uppercase", letterSpacing: "1.5px", margin: 0 }}>Recruiting Agency</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(25,30%,15%)", margin: 0 }}>FLIGHT TICKET</div>
          <div style={{ fontSize: 12, color: "hsl(25,20%,45%)", marginTop: 2 }}>{ticket.ticket_code}</div>
        </div>
      </div>

      {/* Passenger Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "hsl(25,30%,97%)", border: "1px solid hsl(25,10%,90%)", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Passenger</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(25,40%,15%)", marginTop: 2 }}>{s(ticket.candidate?.full_name)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>PNR</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(25,40%,15%)", marginTop: 2, textAlign: "center", letterSpacing: "2px" }}>{s(ticket.pnr)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</div>
          <div style={{ marginTop: 2 }}><span className={`print-status ${ticket.status}`}>{ticket.status}</span></div>
        </div>
      </div>

      {/* Flight Route Card */}
      <div style={{ border: "2px solid hsl(25,30%,45%)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        {/* Route Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", background: "hsl(25,30%,45%)", color: "white" }}>
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>{s(ticket.departure_airport, "---")}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{s(ticket.departure_time)}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{ticket.departure_date ? formatDate(ticket.departure_date) : ""}</div>
          </div>
          <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{s(ticket.airline)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.3)" }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.3)" }} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>{s(ticket.flight_number)}</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>{s(ticket.arrival_airport, "---")}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{s(ticket.arrival_time)}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{ticket.arrival_date ? formatDate(ticket.arrival_date) : ""}</div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Airline", value: s(ticket.airline) },
            { label: "Flight No.", value: s(ticket.flight_number) },
            { label: "Ticket No.", value: s(ticket.ticket_number) },
            { label: "PNR", value: s(ticket.pnr) },
          ].map((f) => (
            <div key={f.label} style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)", borderBottom: "1px solid hsl(25,10%,90%)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Fare Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Ticket Price", value: formatCurrency(ticket.ticket_price || 0) },
            { label: "Agent Commission", value: formatCurrency(ticket.agent_commission || 0) },
            { label: "Other Charges", value: formatCurrency(ticket.other_charges || 0) },
          ].map((f) => (
            <div key={f.label} style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid hsl(25,10%,90%)" }}>
          <div style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "hsl(25,30%,45%)", marginTop: 2 }}>{formatCurrency(total)}</div>
          </div>
          <div style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Paid</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "hsl(140,20%,35%)", marginTop: 2 }}>{formatCurrency(paid)}</div>
          </div>
          <div style={{ padding: "12px 16px", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Remaining</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "hsl(40,30%,45%)", marginTop: 2 }}>{formatCurrency(remaining)}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "2px solid hsl(25,30%,45%)", paddingTop: 16, marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
          {["Passenger Signature", "Authorized Signature", "Date"].map((label) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ width: 180, borderTop: "1px solid #000", marginBottom: 6 }} />
              <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
