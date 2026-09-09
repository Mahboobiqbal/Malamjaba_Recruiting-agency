import { formatDate, formatCurrency } from "../../lib/utils";
import type { MedicalToken } from "../../types";

interface Props {
  token: MedicalToken;
}

export default function MedicalPrintDocument({ token }: Props) {
  return (
    <div className="print-document relative">
      <div className="print-watermark">MALAMJABA</div>

      {/* Header */}
      <div className="print-header">
        <div className="print-logo">
          <div className="print-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <div className="print-logo-text">
            <h1>Malamjaba</h1>
            <p>Recruiting Agency</p>
          </div>
        </div>
        <div className="print-title">
          <h2>Medical Token</h2>
          <p>{token.token_code}</p>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="print-section">
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

      {/* Medical Details */}
      <div className="print-section">
        <div className="print-section-title">Medical Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Token Number</span>
            <span className="print-field-value">{token.token_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Center</span>
            <span className="print-field-value">{token.medical_center || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Date</span>
            <span className="print-field-value">{token.medical_date ? formatDate(token.medical_date) : "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Appointment Date</span>
            <span className="print-field-value">{token.appointment_date ? formatDate(token.appointment_date) : "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Medical Fee</span>
            <span className="print-field-value large">{formatCurrency(token.medical_fee || 0)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Status</span>
            <span className={`print-status ${token.medical_status}`}>{token.medical_status}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Payment Status</span>
            <span className={`print-status ${token.payment_status || "unpaid"}`}>{token.payment_status || "unpaid"}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
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
