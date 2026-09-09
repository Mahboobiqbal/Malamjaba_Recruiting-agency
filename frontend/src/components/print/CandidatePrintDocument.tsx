import { formatDate, formatCurrency } from "../../lib/utils";
import type { Candidate } from "../../types";

interface Props {
  candidate: Candidate;
}

export default function CandidatePrintDocument({ candidate }: Props) {
  const s = (v: string | undefined | null, fb = "-") => v || fb;
  const medicalTokens = candidate.medical_tokens || [];
  const visas = candidate.visas || [];
  const tickets = candidate.tickets || [];
  const payments = candidate.payments || [];

  const totalMedical = medicalTokens.reduce((sum, t) => sum + (t.medical_fee || 0), 0);
  const totalVisa = visas.reduce((sum, v) => sum + (v.total_cost || 0), 0);
  const totalTicket = tickets.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const grandTotal = totalMedical + totalVisa + totalTicket;
  const remaining = grandTotal - totalPaid;

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
          <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(25,30%,15%)", margin: 0 }}>CANDIDATE PROFILE</div>
          <div style={{ fontSize: 12, color: "hsl(25,20%,45%)", marginTop: 2 }}>{candidate.candidate_code}</div>
        </div>
      </div>

      {/* Candidate Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "hsl(25,30%,97%)", border: "1px solid hsl(25,10%,90%)", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(25,40%,15%)", marginTop: 2 }}>{s(candidate.full_name)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Passport</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(25,40%,15%)", marginTop: 2, textAlign: "center", letterSpacing: "1px" }}>{s(candidate.passport_number)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</div>
          <div style={{ marginTop: 2 }}>
            <span className={`print-status ${candidate.status}`}>{candidate.status?.replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Personal Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Father Name", value: s(candidate.father_name) },
            { label: "CNIC", value: s(candidate.cnic) },
            { label: "Gender", value: s(candidate.gender) },
            { label: "Date of Birth", value: candidate.date_of_birth ? formatDate(candidate.date_of_birth) : "-" },
            { label: "Mobile", value: s(candidate.mobile) },
            { label: "Alt. Mobile", value: s(candidate.alternate_mobile) },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "10px 16px", borderRight: i % 3 !== 2 ? "1px solid hsl(25,10%,90%)" : "none", borderBottom: "1px solid hsl(25,10%,90%)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "City", value: s(candidate.city) },
            { label: "Country", value: s(candidate.country) },
            { label: "Address", value: s(candidate.address) },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "10px 16px", borderRight: i % 3 !== 2 ? "1px solid hsl(25,10%,90%)" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Details */}
      <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Professional Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Profession", value: s(candidate.profession) },
            { label: "Employer", value: s(candidate.employer) },
            { label: "Visa Category", value: s(candidate.job_visa_category) },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "10px 16px", borderRight: i % 3 !== 2 ? "1px solid hsl(25,10%,90%)" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid hsl(25,10%,90%)" }}>
          {[
            { label: "Agent", value: s(candidate.agent?.name) },
            { label: "Reference", value: s(candidate.reference) },
            { label: "Registration Date", value: candidate.registration_date ? formatDate(candidate.registration_date) : "-" },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "10px 16px", borderRight: i % 3 !== 2 ? "1px solid hsl(25,10%,90%)" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Tokens */}
      {medicalTokens.length > 0 && (
        <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Medical Tokens ({medicalTokens.length})</span>
            <span style={{ fontWeight: 800 }}>Total: {formatCurrency(totalMedical)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,98%)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.5px" }}>Token Code</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Center</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Date</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Medical Status</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Payment</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Fee</th>
              </tr>
            </thead>
            <tbody>
              {medicalTokens.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid hsl(25,10%,90%)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s(t.token_code)}</td>
                  <td style={{ padding: "8px 12px" }}>{s(t.medical_center)}</td>
                  <td style={{ padding: "8px 12px" }}>{t.medical_date ? formatDate(t.medical_date) : "-"}</td>
                  <td style={{ padding: "8px 12px" }}><span className={`print-status ${t.medical_status === "completed" ? "active" : "pending"}`}>{t.medical_status}</span></td>
                  <td style={{ padding: "8px 12px" }}><span className={`print-status ${t.payment_status === "paid" ? "paid" : "unpaid"}`}>{t.payment_status}</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(t.medical_fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visas */}
      {visas.length > 0 && (
        <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Visas ({visas.length})</span>
            <span style={{ fontWeight: 800 }}>Total: {formatCurrency(totalVisa)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,98%)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Visa Code</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Type</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Country</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Total</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Paid</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {visas.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid hsl(25,10%,90%)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s(v.visa_code)}</td>
                  <td style={{ padding: "8px 12px" }}>{s(v.visa_type)}</td>
                  <td style={{ padding: "8px 12px" }}>{s(v.country)}</td>
                  <td style={{ padding: "8px 12px" }}><span className={`print-status ${v.status}`}>{v.status}</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(v.total_cost)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "hsl(140,20%,35%)", fontWeight: 600 }}>{formatCurrency(v.paid_amount)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "hsl(40,30%,45%)", fontWeight: 600 }}>{formatCurrency(v.remaining_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tickets */}
      {tickets.length > 0 && (
        <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Tickets ({tickets.length})</span>
            <span style={{ fontWeight: 800 }}>Total: {formatCurrency(totalTicket)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,98%)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Ticket Code</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Airline</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Route</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Flight</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Total</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Paid</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid hsl(25,10%,90%)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s(t.ticket_code)}</td>
                  <td style={{ padding: "8px 12px" }}>{s(t.airline)}</td>
                  <td style={{ padding: "8px 12px", letterSpacing: 1 }}>{s(t.departure_airport)} → {s(t.arrival_airport)}</td>
                  <td style={{ padding: "8px 12px" }}>{s(t.flight_number)}</td>
                  <td style={{ padding: "8px 12px" }}><span className={`print-status ${t.status}`}>{t.status}</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(t.total)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "hsl(140,20%,35%)", fontWeight: 600 }}>{formatCurrency(t.paid)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "hsl(40,30%,45%)", fontWeight: 600 }}>{formatCurrency(t.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grand Total */}
      <div style={{ border: "2px solid hsl(25,30%,45%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Financial Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Medical Fees", value: formatCurrency(totalMedical) },
            { label: "Visa Fees", value: formatCurrency(totalVisa) },
            { label: "Ticket Fees", value: formatCurrency(totalTicket) },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "12px 16px", borderRight: i % 3 !== 2 ? "1px solid hsl(25,10%,90%)" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>{f.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(25,40%,15%)", marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid hsl(25,10%,90%)" }}>
          <div style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Grand Total</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "hsl(25,30%,45%)", marginTop: 2 }}>{formatCurrency(grandTotal)}</div>
          </div>
          <div style={{ padding: "12px 16px", borderRight: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Total Paid</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "hsl(140,20%,35%)", marginTop: 2 }}>{formatCurrency(totalPaid)}</div>
          </div>
          <div style={{ padding: "12px 16px", background: "hsl(25,30%,97%)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "hsl(25,20%,50%)", textTransform: "uppercase" }}>Remaining</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "hsl(40,30%,45%)", marginTop: 2 }}>{formatCurrency(remaining)}</div>
          </div>
        </div>
      </div>

      {/* Payments */}
      {payments.length > 0 && (
        <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment History ({payments.length})</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(25,10%,90%)", background: "hsl(25,30%,98%)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Receipt</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Date</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Type</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Method</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "hsl(25,20%,50%)", textTransform: "uppercase", fontSize: 10 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid hsl(25,10%,90%)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s(p.receipt_number)}</td>
                  <td style={{ padding: "8px 12px" }}>{p.payment_date ? formatDate(p.payment_date) : "-"}</td>
                  <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{s(p.payment_type)}</td>
                  <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{s(p.payment_method)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "hsl(140,20%,35%)", fontSize: 14 }}>{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {candidate.notes && (
        <div style={{ border: "1px solid hsl(25,10%,90%)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "hsl(25,30%,45%)", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</div>
          <div style={{ padding: "12px 16px", fontSize: 13, color: "hsl(25,40%,25%)", lineHeight: 1.6 }}>{candidate.notes}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "2px solid hsl(25,30%,45%)", paddingTop: 16, marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
          {["Candidate Signature", "Authorized Signature", "Date"].map((label) => (
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
