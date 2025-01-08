import React, { useState } from 'react'
import activitiesCSV from '../../public/activities.csv?raw'

interface DayData {
  date: string;
  completed: boolean;
}

// Add the getPSTDate helper function
const getPSTDate = () => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
};

const ActivityCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));

  // Parse CSV data
  const parseCSV = (csv: string) => {
    const [header, ...rows] = csv.trim().split('\n');
    const activities: { [key: string]: boolean } = {};
    rows.forEach(row => {
      const [date, completed] = row.split(',');
      const cleanDate = date.trim();
      activities[cleanDate] = completed.trim() === 'true';
    });
    return activities;
  };

  const activities = parseCSV(activitiesCSV);

  // Helper functions for date checking
  const isToday = (dateStr: string) => {
    const today = getPSTDate();
    const compareDate = new Date(dateStr + "T00:00:00-08:00"); // Force PST timezone
    return today.getFullYear() === compareDate.getFullYear() &&
           today.getMonth() === compareDate.getMonth() &&
           today.getDate() === compareDate.getDate();
  };

  const hasDatePassed = (dateStr: string) => {
    const today = getPSTDate();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateStr + "T00:00:00-08:00"); // Force PST timezone
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Function to generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: DayData[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: '', completed: false });
    }
    
    // Add the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isCurrentDay = isToday(dateStr);
      days.push({ 
        date: dateStr, 
        completed: isCurrentDay ? null : activities[dateStr] // Set to null if it's today
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="activity-calendar">
      <div className="calendar-header">
        <button 
          onClick={() => {
            const newMonth = currentMonth.getMonth() - 1;
            const newYear = currentMonth.getFullYear();
            if (newYear === 2025 && newMonth >= 0) {
              setCurrentMonth(new Date(2025, newMonth, 1));
            }
          }}
          disabled={currentMonth.getMonth() === 0}
          className={currentMonth.getMonth() === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          ←
        </button>
        <h3>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button 
          onClick={() => {
            const newMonth = currentMonth.getMonth() + 1;
            const newYear = currentMonth.getFullYear();
            if (newYear === 2025 && newMonth <= 11) {
              setCurrentMonth(new Date(2025, newMonth, 1));
            }
          }}
          disabled={currentMonth.getMonth() === 11}
          className={currentMonth.getMonth() === 11 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          →
        </button>
      </div>
      
      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
        
        {days.map((day, index) => {
          const isCurrentDay = day.date && isToday(day.date);
          const isFutureDate = day.date && new Date(day.date + "T00:00:00-08:00") > getPSTDate();
          
          return (
            <div 
              key={`${day.date}-${index}`}
              className={`calendar-day 
                ${!day.date ? 'empty' : ''}
                ${day.date && (day.completed === true || (isCurrentDay && activities[day.date] === true)) ? 'completed' : ''}
                ${day.date && (day.completed === false || (isCurrentDay && activities[day.date] === false)) ? 'failed' : ''}
                ${isCurrentDay && activities[day.date] === undefined ? '!bg-gray-500/50' : ''}
                ${day.date && !isCurrentDay && day.completed === null && hasDatePassed(day.date) && !isFutureDate ? 'missed' : ''}
                ${isFutureDate ? 'future' : ''}`}
            >
              {day.date ? parseInt(day.date.split('-')[2]) : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityCalendar; 