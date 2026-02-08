import React, { useState } from 'react';
import { getChoresForDate, formatDate, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';
import { getAvatarColor } from '../utils/constants';

function Calendar({ chores, teamMembers, selectedDate, onDateSelect, onToggleComplete, onEditChore }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  const getTeamMember = (id) => {
    return teamMembers.find(m => m.id === id);
  };

  const getTeamMemberName = (id) => {
    const member = getTeamMember(id);
    return member ? member.name : 'Unassigned';
  };

  const getChoreColor = (chore) => {
    const member = getTeamMember(chore.assignedTo);
    if (member) {
      return getAvatarColor(member.avatar);
    }
    return '#888'; // Gray for unassigned
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayChores = getChoresForDate(chores, date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="day-number">{day}</div>
          <div className="day-chores">
            {dayChores.slice(0, 3).map(chore => {
              const dateStr = date.toISOString().split('T')[0];
              const isCompleted = chore.completedDates?.includes(dateStr);
              const choreColor = getChoreColor(chore);
              const member = getTeamMember(chore.assignedTo);
              const coMember = chore.isGuild ? getTeamMember(chore.coAssignee) : null;
              return (
                <div
                  key={chore.id}
                  className={`chore-pill ${isCompleted ? 'completed' : ''} ${chore.isGuild ? 'guild' : ''}`}
                  style={{ backgroundColor: isCompleted ? '#5cb85c' : choreColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditChore(chore);
                  }}
                  title={chore.isGuild ? `Guild: ${member?.name} + ${coMember?.name}` : ''}
                >
                  {chore.isGuild && <span className="guild-badge">⚔️</span>}
                  {member && (
                    member.photo ? (
                      <img src={member.photo} alt="" className="chore-pill-avatar" />
                    ) : (
                      <span className="chore-pill-initial" style={{ backgroundColor: getAvatarColor(member.avatar) }}>
                        {member.name.charAt(0)}
                      </span>
                    )
                  )}
                  {chore.isGuild && coMember && (
                    <>
                      {' + '}
                      {coMember.photo ? (
                        <img src={coMember.photo} alt="" className="chore-pill-avatar" />
                      ) : (
                        <span className="chore-pill-initial" style={{ backgroundColor: getAvatarColor(coMember.avatar) }}>
                          {coMember.name.charAt(0)}
                        </span>
                      )}
                    </>
                  )}
                  <span className="chore-title">{chore.title}</span>
                </div>
              );
            })}
            {dayChores.length > 3 && (
              <div className="more-chores">+{dayChores.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get chores for selected date
  const selectedDateChores = getChoresForDate(chores, selectedDate);

  return (
    <div className="calendar-container">
      <div className="calendar-main">
        <div className="calendar-nav">
          <button onClick={prevMonth}>&lt;</button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth}>&gt;</button>
          <button className="today-btn" onClick={goToToday}>Today</button>
        </div>
        <div className="calendar-grid">
          {renderDays()}
        </div>
      </div>

      <div className="day-detail">
        <h3>{formatDate(selectedDate)}</h3>
        {selectedDateChores.length === 0 ? (
          <p className="no-chores">No chores scheduled for this day</p>
        ) : (
          <ul className="day-chore-list">
            {selectedDateChores.map(chore => {
              const dateStr = selectedDate.toISOString().split('T')[0];
              const isCompleted = chore.completedDates?.includes(dateStr);
              const coMember = chore.isGuild ? getTeamMember(chore.coAssignee) : null;
              return (
                <li key={chore.id} className={`day-chore-item ${isCompleted ? 'completed' : ''} ${chore.isGuild ? 'guild' : ''}`}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleComplete(chore, selectedDate)}
                    />
                    <span className="chore-info">
                      {chore.isGuild && <span className="guild-badge-inline">⚔️ Guild Task:</span>}
                      <strong>{chore.title}</strong>
                      <span className="chore-meta">
                        {chore.isGuild 
                          ? `${getTeamMemberName(chore.assignedTo)} + ${getTeamMemberName(chore.coAssignee)}` 
                          : getTeamMemberName(chore.assignedTo)} 
                        {' | '}{chore.recurrence}
                      </span>
                      {chore.description && <span className="chore-desc">{chore.description}</span>}
                    </span>
                  </label>
                  <button className="edit-btn" onClick={() => onEditChore(chore)}>Edit</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Calendar;
