import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try { detail = JSON.parse(text).detail || text; } catch {}
    const error = new Error(typeof detail === "string" ? detail : "Request failed");
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCNIC(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function getErrorMessage(err: any, fallback: string): string {
  if (!err?.data?.detail) return fallback;
  const detail = err.data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg || e.message || String(e)).join(", ");
  }
  if (typeof detail === "object" && detail.msg) return detail.msg;
  return fallback;
}

const FIELD_NAME_MAP: Record<string, string> = {
  "gender": "gender",
  "full_name": "full_name",
  "father_name": "father_name",
  "cnic": "cnic",
  "mobile": "mobile",
  "whatsapp": "whatsapp",
  "email": "email",
  "passport_number": "passport_number",
  "passport_expiry": "passport_expiry",
  "date_of_birth": "date_of_birth",
  "qualification": "qualification",
  "marital_status": "marital_status",
  "address": "address",
  "city": "city",
  "province": "province",
  "nationality": "nationality",
  "religion": "religion",
  "status": "status",
  "name": "name",
  "phone": "phone",
  "contact_person": "contact_person",
  "bank_name": "bank_name",
  "account_number": "account_number",
  "service_type": "service_type",
  "ticket_price": "ticket_price",
  "agent_commission": "agent_commission",
  "other_charges": "other_charges",
  "purchase_price": "purchase_price",
  "selling_price": "selling_price",
  "amount": "amount",
  "password": "password",
  "username": "username",
  "role": "role",
  "commission_rate": "commission_rate",
  "visa_fee": "visa_fee",
  "medical_fee": "medical_fee",
  "total_cost": "total_cost",
  "visa_number": "visa_number",
  "sponsor_number": "sponsor_number",
  "visa_type": "visa_type",
  "country": "country",
  "ticket_number": "ticket_number",
  "pnr": "pnr",
  "airline": "airline",
  "flight_number": "flight_number",
  "departure_airport": "departure_airport",
  "arrival_airport": "arrival_airport",
  "departure_date": "departure_date",
  "departure_time": "departure_time",
  "origin": "origin",
  "destination": "destination",
  "travel_date": "travel_date",
  "travel_time": "travel_time",
  "passenger_name": "passenger_name",
  "candidate_id": "candidate_id",
  "agent_id": "agent_id",
  "remarks": "remarks",
  "medical_center": "medical_center",
  "token_number": "token_number",
  "payment_method": "payment_method",
  "reference_number": "reference_number",
  "vendor_id": "vendor_id",
  "bank_info": "bank_info",
  "notes": "notes",
  "current_password": "current_password",
  "new_password": "new_password",
};

export function getFieldErrors(err: any): Record<string, string> {
  const result: Record<string, string> = {};
  if (!err?.data?.detail) return result;
  const detail = err.data.detail;
  let messages: string[] = [];
  if (typeof detail === "string") {
    messages = detail.split("; ");
  } else if (Array.isArray(detail)) {
    messages = detail.map((e: any) => e.msg || e.message || String(e));
  }
  for (const msg of messages) {
    const colonIdx = msg.indexOf(":");
    if (colonIdx > 0) {
      const label = msg.slice(0, colonIdx).trim().toLowerCase();
      const message = msg.slice(colonIdx + 1).trim();
      for (const [key, nameLabel] of Object.entries(FIELD_NAME_MAP)) {
        if (label === nameLabel || label === key.replace(/_/g, " ")) {
          result[key] = message;
          break;
        }
      }
      if (!Object.values(result).includes(message)) {
        for (const [key] of Object.entries(FIELD_NAME_MAP)) {
          if (label.includes(key.replace(/_/g, " "))) {
            result[key] = message;
            break;
          }
        }
      }
    } else {
      const missingMatch = msg.match(/^(.+?)\s+is\s+required$/i);
      if (missingMatch) {
        const label = missingMatch[1].trim().toLowerCase();
        for (const [key, nameLabel] of Object.entries(FIELD_NAME_MAP)) {
          if (label === nameLabel || label === key.replace(/_/g, " ")) {
            result[key] = msg;
            break;
          }
        }
      }
    }
  }
  return result;
}
