export const CANDIDATE_STATUSES = [
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "medical_pending", label: "Medical Pending" },
  { value: "medical_completed", label: "Medical Completed" },
  { value: "visa_processing", label: "Visa Processing" },
  { value: "visa_approved", label: "Visa Approved" },
  { value: "ticket_pending", label: "Ticket Pending" },
  { value: "ticket_booked", label: "Ticket Booked" },
  { value: "ready_to_travel", label: "Ready to Travel" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const MEDICAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "token_issued", label: "Token Issued" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export const VISA_STATUSES = [
  { value: "processing", label: "Processing" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

export const TICKET_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reserved", label: "Reserved" },
  { value: "confirmed", label: "Confirmed" },
  { value: "issued", label: "Issued" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online_transfer", label: "Online Transfer" },
  { value: "other", label: "Other" },
];

export const EXPENSE_CATEGORIES = [
  { value: "office", label: "Office Expense" },
  { value: "medical", label: "Medical Expense" },
  { value: "visa", label: "Visa Expense" },
  { value: "ticket", label: "Ticket Expense" },
  { value: "agent_commission", label: "Agent Commission" },
  { value: "transportation", label: "Transportation" },
  { value: "salary", label: "Salary" },
  { value: "utility", label: "Utility" },
  { value: "other", label: "Other" },
];

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "cnic", label: "CNIC" },
  { value: "visa", label: "Visa" },
  { value: "medical_report", label: "Medical Report" },
  { value: "ticket", label: "Ticket" },
  { value: "photo", label: "Photograph" },
  { value: "employment", label: "Employment Documents" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

export const AGENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export const PAYMENT_TYPES = [
  { value: "full", label: "Full Payment" },
  { value: "partial", label: "Partial Payment" },
  { value: "advance", label: "Advance Payment" },
  { value: "refund", label: "Refund" },
  { value: "adjustment", label: "Adjustment" },
];
