import { formatDate, formatCurrency } from "../../lib/utils";
import type { Visa } from "../../types";

interface Props {
  visa: Visa;
  totalCost?: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export default function VisaPrintDocument({ visa, totalCost = 0, paidAmount = 0, remainingAmount = 0 }: Props) {
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
          <h2>Visa Document</h2>
          <p>{visa.visa_code}</p>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="print-section">
        <div className="print-section-title">Candidate Information</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Full Name</span>
            <span className="print-field-value">{visa.candidate?.full_name || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Country</span>
            <span className="print-field-value">{visa.country}</span>
          </div>
        </div>
      </div>

      {/* Visa Details */}
      <div className="print-section">
        <div className="print-section-title">Visa Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Visa Type</span>
            <span className="print-field-value">{visa.visa_type}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Visa Number</span>
            <span className="print-field-value">{visa.visa_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Sponsor Number</span>
            <span className="print-field-value">{(visa as any).sponsor_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Status</span>
            <span className={`print-status ${visa.status}`}>{visa.status}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Issue Date</span>
            <span className="print-field-value">{visa.issue_date ? formatDate(visa.issue_date) : "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Expiry Date</span>
            <span className="print-field-value">{visa.expiry_date ? formatDate(visa.expiry_date) : "-"}</span>
          </div>
        </div>
      </div>

      <hr className="print-divider" />

      {/* Financial Details */}
      <div className="print-section">
        <div className="print-section-title">Financial Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Visa Fee</span>
            <span className="print-field-value">{formatCurrency(visa.visa_fee || 0)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Agent Fee</span>
            <span className="print-field-value">{formatCurrency(visa.agent_fee || 0)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Other Charges</span>
            <span className="print-field-value">{formatCurrency((visa as any).other_charges || 0)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Total Cost</span>
            <span className="print-field-value large">{formatCurrency(totalCost)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Paid Amount</span>
            <span className="print-field-value">{formatCurrency(paidAmount)}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Remaining</span>
            <span className="print-field-value">{formatCurrency(remainingAmount)}</span>
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
