import { useCallback, useMemo, useState, type JSX } from "react";
import "./Calendar.css";
import { isSameDay, isToday } from "../../utils/date";

interface CalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

function Calendar({ currentDate, onDateSelect }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentDate);

  const monthName = useMemo(
    () => viewDate.toLocaleDateString("en-US", { month: "long" }),
    [viewDate],
  );
  const year = viewDate.getFullYear();

  const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      onDateSelect(date);
    },
    [onDateSelect],
  );

  const handleToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
    onDateSelect(today);
  }, [onDateSelect]);

  const renderDays = useCallback(() => {
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="calendar__day calendar__day--empty"
        />,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, viewDate.getMonth(), day);
      const isSelected = selectedDate && isSameDay(selectedDate, date);

      days.push(
        <button
          key={day}
          className={`calendar__day ${isToday(date) ? "calendar__day--today" : ""} ${isSelected ? "calendar__day--selected" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </button>,
      );
    }
    return days;
  }, [viewDate, firstDayOfMonth, daysInMonth, selectedDate, handleDateClick]);

  return (
    <div className="calendar-overlay">
      <div className="calendar" onClick={(e) => e.stopPropagation()}>
        <div className="calendar__header">
          <button className="calendar__nav-btn" onClick={handlePrevMonth}>
            ‹
          </button>
          <span className="calendar__title">
            {monthName} {year}
          </span>
          <button className="calendar__nav-btn" onClick={handleNextMonth}>
            ›
          </button>
        </div>

        <div className="calendar__weekdays">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="calendar__weekday">
              {day}
            </span>
          ))}
        </div>

        <div className="calendar__grid">{renderDays()}</div>

        <div className="calendar__footer">
          <button className="calendar__today-btn" onClick={handleToday}>
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
