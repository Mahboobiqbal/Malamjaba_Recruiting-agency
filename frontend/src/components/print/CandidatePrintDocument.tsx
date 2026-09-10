import React from "react";
import { Candidate } from "../../types";
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
  candidate: Candidate;
}

export default function CandidatePrintDocument({ candidate }: Props) {
  const c = candidate as any;

  const totalMedical = (c.medical_tokens || []).reduce((s: number, m: any) => s + (m.medical_fee || 0), 0);
  const totalVisa = (c.visas || []).reduce((s: number, v: any) => s + (v.total_cost || 0), 0);
  const totalTicket = (c.tickets || []).reduce((s: number, t: any) => s + (t.total || 0), 0);
  const totalPaid = (c.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const grandTotal = totalMedical + totalVisa + totalTicket;
  const remaining = grandTotal - totalPaid;

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
      <PrintHeader title="CANDIDATE PROFILE" code={c.candidate_code} company={DEFAULT_COMPANY} />

      <div className="print-section" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 12, padding: "10px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <div style={{ flex: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Full Name</span>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "#1e293b" }}>{c.full_name}</p>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Passport</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>{c.passport_number || "-"}</p>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
            <p style={{ margin: "2px 0 0" }}>
              <span className={`print-status ${c.status}`}>{(c.status || "").replace("_", " ")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Personal Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Father Name</span>
            <span className="print-field-value">{c.father_name || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">CNIC</span>
            <span className="print-field-value">{c.cnic || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Gender</span>
            <span className="print-field-value">{c.gender || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Date of Birth</span>
            <span className="print-field-value">{formatDateShort(c.date_of_birth)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Mobile</span>
            <span className="print-field-value">{c.mobile || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Alt. Mobile</span>
            <span className="print-field-value">{c.alt_mobile || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">City</span>
            <span className="print-field-value">{c.city || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Country</span>
            <span className="print-field-value">{c.country || "-"}</span>
          </div>
          {c.address && (
            <div className="print-field" style={{ gridColumn: "span 2" }}>
              <span className="print-field-label">Address</span>
              <span className="print-field-value">{c.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Professional Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Profession</span>
            <span className="print-field-value">{c.profession || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Employer</span>
            <span className="print-field-value">{c.employer || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Visa Category</span>
            <span className="print-field-value">{c.visa_category || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Agent</span>
            <span className="print-field-value">{c.agent?.name || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Reference</span>
            <span className="print-field-value">{c.reference || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Registration Date</span>
            <span className="print-field-value">{formatDateShort(c.registration_date)}</span>
          </div>
        </div>
      </div>

      {(c.medical_tokens || []).length > 0 && (
        <div className="print-section">
          <div className="print-section-title">Medical Tokens ({(c.medical_tokens || []).length})</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Center</th>
                <th>Date</th>
                <th>Status</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {c.medical_tokens.map((m: any) => (
                <tr key={m.id}>
                  <td>{m.token_code}</td>
                  <td>{m.medical_center || "-"}</td>
                  <td>{formatDateShort(m.medical_date)}</td>
                  <td><span className={`print-status ${m.medical_status}`}>{m.medical_status}</span></td>
                  <td>{formatCurrency(m.medical_fee)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>Total Medical Fees</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(totalMedical)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {(c.visas || []).length > 0 && (
        <div className="print-section">
          <div className="print-section-title">Visas ({(c.visas || []).length})</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Country</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {c.visas.map((v: any) => (
                <tr key={v.id}>
                  <td>{v.visa_code}</td>
                  <td>{v.visa_type || "-"}</td>
                  <td>{v.country || "-"}</td>
                  <td><span className={`print-status ${v.status}`}>{v.status}</span></td>
                  <td>{formatCurrency(v.total_cost)}</td>
                  <td>{formatCurrency(v.paid_amount)}</td>
                  <td>{formatCurrency(v.remaining_amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>Total Visa Fees</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(totalVisa)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {(c.tickets || []).length > 0 && (
        <div className="print-section">
          <div className="print-section-title">Tickets ({(c.tickets || []).length})</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Airline</th>
                <th>Route</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {c.tickets.map((t: any) => (
                <tr key={t.id}>
                  <td>{t.ticket_code}</td>
                  <td>{t.airline || "-"}</td>
                  <td>{t.departure_airport || ""} → {t.arrival_airport || ""}</td>
                  <td><span className={`print-status ${t.status}`}>{t.status}</span></td>
                  <td>{formatCurrency(t.total)}</td>
                  <td>{formatCurrency(t.paid)}</td>
                  <td>{formatCurrency(t.remaining)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>Total Ticket Fees</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(totalTicket)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="print-section">
        <div className="print-section-title">Financial Summary</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Medical Fees</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(totalMedical)}</p>
            </div>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Visa Fees</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(totalVisa)}</p>
            </div>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Ticket Fees</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(totalTicket)}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "#fdf8f3", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "hsl(25, 30%, 45%)", textTransform: "uppercase", fontWeight: 600 }}>Grand Total</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "hsl(25, 30%, 45%)", margin: "4px 0 0" }}>{formatCurrency(grandTotal)}</p>
            </div>
            <div style={{ background: "#f0fdf4", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 600 }}>Total Paid</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#166534", margin: "4px 0 0" }}>{formatCurrency(totalPaid)}</p>
            </div>
            <div style={{ background: "#fffbeb", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#92400e", textTransform: "uppercase", fontWeight: 600 }}>Remaining</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#92400e", margin: "4px 0 0" }}>{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {(c.payments || []).length > 0 && (
        <div className="print-section">
          <div className="print-section-title">Payment History ({(c.payments || []).length})</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Date</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {c.payments.map((p: any) => (
                <tr key={p.id}>
                  <td>{p.receipt_number}</td>
                  <td>{formatDateShort(p.payment_date)}</td>
                  <td>{p.payment_type}</td>
                  <td>{p.payment_method}</td>
                  <td style={{ color: "#166534", fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {c.notes && (
        <div className="print-section">
          <div className="print-section-title">Notes</div>
          <p style={{ fontSize: 13, color: "#475569" }}>{c.notes}</p>
        </div>
      )}

      <div className="print-footer">
        <div className="print-signature">
          <div className="print-signature-line">
            <div className="line" />
            <p>Candidate Signature</p>
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
