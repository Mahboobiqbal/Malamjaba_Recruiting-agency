import React, { useState } from "react";
import { Calendar, X } from "lucide-react";

interface PeriodFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClear: () => void;
}

function getPeriodDates(period: string): { from: string; to: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  switch (period) {
    case "today":
      return { from: `${yyyy}-${mm}-${dd}`, to: `${yyyy}-${mm}-${dd}` };

    case "week": {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sy = startOfWeek.getFullYear();
      const sm = String(startOfWeek.getMonth() + 1).padStart(2, "0");
      const sd = String(startOfWeek.getDate()).padStart(2, "0");
      return { from: `${sy}-${sm}-${sd}`, to: `${yyyy}-${mm}-${dd}` };
    }

    case "month":
      return { from: `${yyyy}-${mm}-01`, to: `${yyyy}-${mm}-${dd}` };

    case "last_month": {
      const lastMonth = new Date(yyyy, today.getMonth() - 1, 1);
      const ly = lastMonth.getFullYear();
      const lm = String(lastMonth.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(ly, today.getMonth(), 0).getDate();
      return { from: `${ly}-${lm}-01`, to: `${ly}-${lm}-${String(lastDay).padStart(2, "0")}` };
    }

    default:
      return { from: "", to: "" };
  }
}

const PERIODS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
];

export default function PeriodFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, onClear }: PeriodFilterProps) {
  const [activePeriod, setActivePeriod] = useState<string>("all");
  const [showCustom, setShowCustom] = useState(false);

  const hasFilter = dateFrom || dateTo;

  const handlePeriodClick = (period: string) => {
    if (period === "all") {
      setActivePeriod("all");
      setShowCustom(false);
      onDateFromChange("");
      onDateToChange("");
    } else if (period === "custom") {
      setShowCustom(true);
      setActivePeriod("custom");
    } else {
      const dates = getPeriodDates(period);
      setActivePeriod(period);
      setShowCustom(false);
      onDateFromChange(dates.from);
      onDateToChange(dates.to);
    }
  };

  const handleClear = () => {
    setActivePeriod("all");
    setShowCustom(false);
    onDateFromChange("");
    onDateToChange("");
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePeriodClick(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePeriod === p.key && !showCustom
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handlePeriodClick("custom")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showCustom
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          Custom
        </button>
        {hasFilter && (
          <button type="button" onClick={handleClear} className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
