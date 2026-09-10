import React from "react";
import { MedicalToken } from "../../types";
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
  token: MedicalToken;
}

export default function MedicalPrintDocument({ token }: Props) {
  const t = token as any;

  const fee = t.medical_fee || 0;
  const paid = t.paid_amount || 0;
  const remaining = Math.max(fee - paid, 0);

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
      <PrintHeader title="MEDICAL TOKEN" code={token.token_code} company={DEFAULT_COMPANY} />

      <div className="print-section" style={{ marginTop: 20 }}>
        <div className="print-section-title">Candidate Information</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Full Name</span>
            <span className="print-field-value">{token.candidate?.full_name || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Candidate Code</span>
            <span className="print-field-value">{token.candidate?.candidate_code || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Passport Number</span>
            <span className="print-field-value">{token.candidate?.passport_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Mobile</span>
            <span className="print-field-value">{token.candidate?.mobile || "-"}</span>
          </div>
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Medical Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Token Number</span>
            <span className="print-field-value">{t.token_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Center</span>
            <span className="print-field-value">{t.medical_center || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Date</span>
            <span className="print-field-value">{formatDateShort(t.medical_date)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Appointment Date</span>
            <span className="print-field-value">{formatDateShort(t.appointment_date)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Status</span>
            <span className={`print-status ${t.medical_status}`}>{t.medical_status || "pending"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Payment Status</span>
            <span className={`print-status ${t.payment_status}`}>{t.payment_status || "unpaid"}</span>
          </div>
        </div>
      </div>

      <div className="print-divider" />

      <div className="print-section">
        <div className="print-section-title">Financial Details</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "#fdf8f3", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "hsl(25, 30%, 45%)", textTransform: "uppercase", fontWeight: 600 }}>Medical Fee</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "hsl(25, 30%, 45%)", margin: "4px 0 0" }}>{formatCurrency(fee)}</p>
            </div>
            <div style={{ background: "#f0fdf4", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 600 }}>Paid Amount</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#166534", margin: "4px 0 0" }}>{formatCurrency(paid)}</p>
            </div>
            <div style={{ background: "#fffbeb", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#92400e", textTransform: "uppercase", fontWeight: 600 }}>Remaining</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#92400e", margin: "4px 0 0" }}>{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="print-footer">
        <div className="print-signature">
          <div className="print-signature-line">
            <div className="line" />
            <p>Candidate Signature</p>
          </div>
          <div className="print-signature-line">
            <div className="line" />
            <p>Medical Center Stamp</p>
          </div>
          <div className="print-signature-line">
            <div className="line" />
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
