import React from "react";

interface PrintHeaderProps {
  title: string;
  code: string;
  company: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export default function PrintHeader({ title, code, company }: PrintHeaderProps) {
  return (
    <>
      <div className="print-watermark">{company.name.toUpperCase()}</div>
      <div className="print-header">
        <div className="print-logo">
          <div className="print-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="print-logo-text">
            <h1>{company.name}</h1>
            {company.address && <p>{company.address}</p>}
            {(company.phone || company.email) && (
              <p>{[company.phone, company.email].filter(Boolean).join(" | ")}</p>
            )}
          </div>
        </div>
        <div className="print-title">
          <h2>{title}</h2>
          <p className="text-sm opacity-75">{code}</p>
        </div>
      </div>
    </>
  );
}
