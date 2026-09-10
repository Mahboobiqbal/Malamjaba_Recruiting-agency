import React from "react";
import { Payment } from "../../types";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import PrintHeader from "./PrintHeader";

const DEFAULT_COMPANY = {
  name: "Malamjaba Recruiting Agency",
  address: "",
  phone: "",
  email: "",
  website: "",
};

const PAYMENT_TYPES: Record<string, string> = {
  full: "Full Payment",
  partial: "Partial Payment",
  advance: "Advance Payment",
  refund: "Refund",
  adjustment: "Adjustment",
};

const PAYMENT_METHODS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  online_transfer: "Online Payment",
  other: "Other",
};

interface Props {
  payment: Payment;
}

export default function PaymentPrintDocument({ payment }: Props) {
  return (
    <div className="print-document">
      <PrintHeader title="PAYMENT RECEIPT" code={payment.payment_code} company={DEFAULT_COMPANY} />

      <div className="print-section" style={{ marginTop: 20 }}>
        <div className="print-section-title">Receipt Details</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">Receipt Number</span>
            <span className="print-field-value">{payment.receipt_number}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">Payment Date</span>
            <span className="print-field-value">{formatDateTime(payment.payment_date)}</span>
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

      <div className="print-section">
        <div className="print-section-title">Payment Amount</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: "#f0fdf4", padding: "16px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#166534", textTransform: "uppercase", fontWeight: 600 }}>Amount Received</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#166534", margin: "8px 0 0" }}>{formatCurrency(payment.amount)}</p>
          </div>
        </div>
      </div>

      {(payment.description || payment.remarks) && (
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
      )}

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
