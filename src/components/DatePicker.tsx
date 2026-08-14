import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateToDisplay, formatDateToDb, parseLocalDate } from '../utils/dateUtils';

interface DatePickerProps {
  value?: string | null; // Expects YYYY-MM-DD or DD-MM-YYYY
  onChange: (valueInDbFormat: string, valueInDisplayFormat: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: string; // YYYY-MM-DD
  minDate?: string; // YYYY-MM-DD
  required?: boolean;
  label?: string;
  error?: string;
  className?: string;
  allowClear?: boolean;
  name?: string;
  id?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  disabled = false,
  maxDate,
  minDate,
  required = false,
  label,
  error,
  className = '',
  allowClear = true,
  name,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Convert incoming value to both formats
  const dbValue = formatDateToDb(value);
  const displayValue = formatDateToDisplay(value);

  // Active calendar view (month & year)
  const currentDateObj = parseLocalDate(dbValue) || new Date();
  const [viewYear, setViewYear] = useState<number>(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(currentDateObj.getMonth());

  useEffect(() => {
    if (dbValue) {
      const parsed = parseLocalDate(dbValue);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [dbValue]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (year: number, month: number, day: number) => {
    const selectedDate = new Date(year, month, day);
    const newDbValue = formatDateToDb(selectedDate);
    const newDisplayValue = formatDateToDisplay(selectedDate);

    // Validation checks
    if (maxDate) {
      const max = parseLocalDate(maxDate);
      if (max && selectedDate > max) return;
    }
    if (minDate) {
      const min = parseLocalDate(minDate);
      if (min && selectedDate < min) return;
    }

    onChange(newDbValue, newDisplayValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days for active view
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells = [];
  // Blank padding cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Years option range (1920 to currentYear + 10)
  const currentYearNum = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYearNum + 10; y >= 1920; y--) {
    yearOptions.push(y);
  }

  const selectedLocalDate = parseLocalDate(dbValue);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Visible Display Input */}
        <input
          id={id}
          name={name}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) setIsOpen(!isOpen);
            }
          }}
          className={`w-full px-3.5 py-2.5 bg-white border ${
            error ? 'border-red-500' : 'border-slate-300 focus:border-[#102bde]'
          } rounded-xl text-slate-900 text-sm focus:outline-none transition-colors cursor-pointer pr-16 ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
          }`}
        />

        {/* Hidden Native Input for Native Picker Fallback / Touch Devices */}
        <input
          ref={nativeInputRef}
          type="date"
          tabIndex={-1}
          value={dbValue}
          max={maxDate}
          min={minDate}
          disabled={disabled}
          onChange={(e) => {
            const rawVal = e.target.value;
            if (rawVal) {
              const d = parseLocalDate(rawVal);
              if (d) {
                onChange(formatDateToDb(d), formatDateToDisplay(d));
              }
            } else {
              onChange('', '');
            }
          }}
          className="sr-only"
        />

        {/* Right Action Icons */}
        <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
          {allowClear && displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 rounded-full transition-colors"
              title="Limpar data"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="p-1 hover:text-[#102bde] transition-colors"
            title="Abrir calendário"
          >
            <CalendarIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}

      {/* Visual Popover Calendar */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-slate-800 top-full left-0 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-transparent hover:bg-slate-100 py-1 px-1.5 rounded-md border-0 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-transparent hover:bg-slate-100 py-1 px-1.5 rounded-md border-0 focus:outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[10px] font-bold text-slate-400 uppercase">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`blank-${idx}`} className="h-8" />;
              }

              const cellDate = new Date(viewYear, viewMonth, dayNum);
              const cellDbStr = formatDateToDb(cellDate);

              const isSelected =
                selectedLocalDate &&
                selectedLocalDate.getFullYear() === viewYear &&
                selectedLocalDate.getMonth() === viewMonth &&
                selectedLocalDate.getDate() === dayNum;

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === dayNum;

              let isDisabledCell = false;
              if (maxDate) {
                const max = parseLocalDate(maxDate);
                if (max && cellDate > max) isDisabledCell = true;
              }
              if (minDate) {
                const min = parseLocalDate(minDate);
                if (min && cellDate < min) isDisabledCell = true;
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isDisabledCell}
                  onClick={() => handleDateSelect(viewYear, viewMonth, dayNum)}
                  className={`h-8 w-8 text-xs rounded-xl font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#102bde] text-white font-bold shadow-md'
                      : isToday
                      ? 'border border-[#102bde] text-[#102bde] font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  } ${isDisabledCell ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateSelect(today.getFullYear(), today.getMonth(), today.getDate());
              }}
              className="text-[#102bde] font-bold hover:underline"
            >
              Hoje
            </button>
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-800"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
