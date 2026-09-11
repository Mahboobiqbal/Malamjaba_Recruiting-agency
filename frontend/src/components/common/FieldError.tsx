import React from "react";

export default function FieldError({ errors, field }: { errors: Record<string, string>; field: string }) {
  if (!errors[field]) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors[field]}</p>;
}
