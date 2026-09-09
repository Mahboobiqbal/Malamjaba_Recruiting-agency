import { formatDateTime, formatCurrency } from "../../lib/utils";
import type { Payment } from "../../types";

interface Props {
  payment: Payment;
}

const PAYMENT_TYPES: Record<string, string> = {
  full: "Full Payment",
  partial: "Partial Payment",
  advance: "Advance Payment",
  final: "Final Payment",
};

const PAYMENT_METHODS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  online: "Online Payment",
};

export default function PaymentPrintDocument({ payment }: Props) {
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
          <h2>Payment Receipt</h2>
          <p>{payment.payment_code}</p>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="print-section">
        <div className="print-section-title">Receipt Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Receipt Number</span>
            <span className="print-field-value">{payment.receipt_number || "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Payment Date</span>
            <span className="print-field-value">{payment.payment_date ? formatDateTime(payment.payment_date) : "-"}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Candidate</span>
            <span className="print-field-value">{payment.candidate?.full_name || "-"}</span>
          </div>
          {payment.agent && (
            <div className="print-field">
              <span className="print-field-label">Agent</span>
              <span className="print-field-value">{payment.agent.name}</span>
            </div>
          )}
          <div className="print-field">
            <span className="print-field-label">Payment Type</span>
            <span className="print-field-value">{PAYMENT_TYPES[payment.payment_type] || payment.payment_type}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Payment Method</span>
            <span className="print-field-value">{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</span>
          </div>
          {payment.reference_number && (
            <div className="print-field">
              <span className="print-field-label">Reference Number</span>
              <span className="print-field-value">{payment.reference_number}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="print-section">
        <div className="print-section-title">Amount</div>
        <div className="print-field">
          <span className="print-field-label">Payment Amount</span>
          <span className="print-field-value large">{formatCurrency(payment.amount)}</span>
        </div>
      </div>

      {/* Description / Remarks */}
      {(payment.description || payment.remarks) && (
        <>
          <hr className="print-divider" />
          <div className="print-section">
            <div className="print-section-title">Notes</div>
            {payment.description && (
              <div className="print-field" style={{ marginBottom: 8 }}>
                <span className="print-field-label">Description</span>
                <span className="print-field-value">{payment.description}</span>
              </div>
            )}
            {payment.remarks && (
              <div className="print-field">
                <span className="print-field-label">Remarks</span>
                <span className="print-field-value">{payment.remarks}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="print-footer">
        <div className="print-signature">
          <div className="print-signature-line">
            <div className="line" />
            <p>Received By</p>
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
