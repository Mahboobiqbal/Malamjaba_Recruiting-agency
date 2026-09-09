import { Calendar, X } from "lucide-react";

interface Props {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClear: () => void;
  label?: string;
}

export default function DateFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, onClear, label = "Date" }: Props) {
  const hasFilter = dateFrom || dateTo;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
        <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{label}:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="border-0 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none w-[130px]"
        />
        <span className="text-slate-400 dark:text-slate-500 text-xs">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="border-0 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none w-[130px]"
        />
      </div>
      {hasFilter && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  );
}
