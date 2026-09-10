export interface User {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  is_superadmin: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Agent {
  id: number;
  agent_code: string;
  name: string;
  father_name?: string;
  cnic: string;
  mobile: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  email?: string;
  commission_rate: number;
  bank_info?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: number;
  candidate_code: string;
  full_name: string;
  father_name?: string;
  cnic?: string;
  passport_number: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  date_of_birth?: string;
  gender?: string;
  mobile: string;
  alternate_mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  profession?: string;
  employer?: string;
  job_visa_category?: string;
  agent_id?: number;
  reference?: string;
  registration_date: string;
  status: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  medical_tokens?: MedicalToken[];
  visas?: Visa[];
  tickets?: Ticket[];
  payments?: Payment[];
}

export interface MedicalToken {
  id: number;
  token_code: string;
  candidate_id: number;
  token_number?: string;
  agent_id?: number;
  medical_center?: string;
  medical_date?: string;
  appointment_date?: string;
  medical_fee: number;
  paid_amount: number;
  payment_status: string;
  medical_status: string;
  remarks?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  candidate?: Candidate;
  agent?: Agent;
}

export interface Visa {
  id: number;
  visa_code: string;
  candidate_id: number;
  agent_id?: number;
  visa_type?: string;
  country?: string;
  visa_number?: string;
  reference_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status: string;
  profession?: string;
  employer?: string;
  sponsor?: string;
  sponsor_number?: string;
  wakala_reference?: string;
  visa_fee: number;
  agent_fee: number;
  other_charges: number;
  total_cost: number;
  paid_amount: number;
  remaining_amount: number;
  remarks?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  candidate?: Candidate;
  agent?: Agent;
}

export interface Ticket {
  id: number;
  ticket_code: string;
  candidate_id: number;
  agent_id?: number;
  airline?: string;
  pnr?: string;
  ticket_number?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_date?: string;
  departure_time?: string;
  arrival_date?: string;
  arrival_time?: string;
  baggage_allowance?: string;
  ticket_class?: string;
  ticket_price: number;
  agent_commission: number;
  other_charges: number;
  total: number;
  paid: number;
  remaining: number;
  status: string;
  remarks?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  candidate?: Candidate;
  agent?: Agent;
}

export interface Payment {
  id: number;
  payment_code: string;
  receipt_number: string;
  candidate_id?: number;
  agent_id?: number;
  visa_id?: number;
  ticket_id?: number;
  medical_token_id?: number;
  payment_date: string;
  payment_type: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  description?: string;
  received_by?: number;
  remarks?: string;
  created_at: string;
  candidate?: Candidate;
  agent?: Agent;
  visa?: {
    id: number;
    visa_code: string;
    visa_type?: string;
    country?: string;
    total_cost: number;
    paid_amount: number;
    remaining_amount: number;
  };
  ticket?: {
    id: number;
    ticket_code: string;
    airline?: string;
    departure_airport?: string;
    arrival_airport?: string;
    total: number;
    paid: number;
    remaining: number;
  };
  medical_token?: {
    id: number;
    token_code: string;
    medical_center?: string;
    medical_fee: number;
    payment_status: string;
  };
}

export interface Expense {
  id: number;
  expense_code: string;
  date: string;
  category: string;
  description?: string;
  amount: number;
  payment_method: string;
  paid_to?: string;
  reference?: string;
  created_by?: number;
  remarks?: string;
  created_at: string;
}

export interface LedgerEntry {
  id: number;
  candidate_id: number;
  entry_type: string;
  reference_type?: string;
  reference_id?: number;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  created_by?: number;
  created_at: string;
}

export interface DashboardSummary {
  total_candidates: number;
  new_candidates: number;
  medical_pending: number;
  medical_completed: number;
  visa_processing: number;
  visa_approved: number;
  tickets_booked: number;
  pending_payments: number;
  today_payments: number;
  outstanding_balances: number;
  total_received: number;
  total_pending: number;
  total_expenses: number;
  total_agent_commission: number;
  net_amount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
