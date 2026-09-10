import React from "react";
import { Visa } from "../../types";
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
  visa: Visa;
  totalCost?: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export default function VisaPrintDocument({ visa, totalCost, paidAmount, remainingAmount }: Props) {
  const v = visa as any;

  const total = totalCost ?? v.total_cost ?? 0;
  const paid = paidAmount ?? v.paid_amount ?? 0;
  const remaining = remainingAmount ?? v.remaining_amount ?? 0;

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
      <PrintHeader title="VISA DOCUMENT" code={visa.visa_code} company={DEFAULT_COMPANY} />

      <div className="print-section" style={{ marginTop: 20 }}>
        <div className="print-section-title">Candidate Information</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Full Name</span>
            <span className="print-field-value">{visa.candidate?.full_name || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Country</span>
            <span className="print-field-value">{v.country || "-"}</span>
          </div>
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Visa Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Visa Type</span>
            <span className="print-field-value">{v.visa_type || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Visa Number</span>
            <span className="print-field-value">{v.visa_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Sponsor Number</span>
            <span className="print-field-value">{v.sponsor_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Status</span>
            <span className={`print-status ${visa.status}`}>{visa.status}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Issue Date</span>
            <span className="print-field-value">{formatDateShort(v.issue_date)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Expiry Date</span>
            <span className="print-field-value">{formatDateShort(v.expiry_date)}</span>
          </div>
        </div>
      </div>

      <div className="print-divider" />

      <div className="print-section">
        <div className="print-section-title">Financial Details</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Visa Fee</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(v.visa_fee || 0)}</p>
            </div>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Agent Fee</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(v.agent_fee || 0)}</p>
            </div>
            <div style={{ background: "white", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Other Charges</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "4px 0 0" }}>{formatCurrency(v.other_charges || 0)}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#e2e8f0" }}>
            <div style={{ background: "#fdf8f3", padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "hsl(25, 30%, 45%)", textTransform: "uppercase", fontWeight: 600 }}>Total Cost</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "hsl(25, 30%, 45%)", margin: "4px 0 0" }}>{formatCurrency(total)}</p>
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
