import { useState, type JSX } from "react";
import './Calendar.css';

interface CalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

function Calendar({ currentDate, onDateSelect }: CalendarProps) {
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const [selectedDate, setSelectedDate] = useState<Date | null>(currentDate);

    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long' });
    const year = viewDate.getFullYear();

    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month + 1, 0).getDate();
    }

    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month, 1).getDay();
    }

    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }

    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect(date);
    }

    const handleToday = () => {
        const today = new Date();
        setViewDate(today);
        setSelectedDate(today);
        onDateSelect(today);
    }

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();

        const days: JSX.Element[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar__day calendar__day--empty" />)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = today.getDate() === day && 
                today.getMonth() === month && 
                today.getFullYear() === year;
            const isSelected = selectedDate && 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            days.push(
                <button
                    key={day}
                    className={`calendar__day ${isToday ? 'calendar__day--today' : ''} ${isSelected ? 'calendar__day--selected' : ''}`}
                    onClick={() => handleDateClick(date)}
                >
                    {day}
                </button>
            )
        }
        return days;
    }

    return (
        <div className="calendar-overlay">
            <div className="calendar" onClick={(e) => e.stopPropagation()}>
                <div className="calendar__header">
                    <button className="calendar__nav-btn" onClick={handlePrevMonth}>‹</button>
                    <span className="calendar__title">{monthName} {year}</span>
                    <button className="calendar__nav-btn" onClick={handleNextMonth}>›</button>
                </div>
                
                <div className="calendar__weekdays">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <span key={day} className="calendar__weekday">{day}</span>
                    ))}
                </div>
                
                <div className="calendar__grid">
                    {renderDays()}
                </div>
                
                <div className="calendar__footer">
                    <button className="calendar__today-btn" onClick={handleToday}>
                        Today
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Calendar;