import React from 'react';

function ChoreList({ chores, teamMembers, onEdit, onDelete }) {
  const getTeamMemberName = (id) => {
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : 'Unassigned';
  };

  const getRecurrenceLabel = (recurrence) => {
    const labels = {
      none: 'One-time',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    };
    return labels[recurrence] || recurrence;
  };

  if (chores.length === 0) {
    return (
      <div className="empty-state">
        <p>No chores yet. Add your first chore to get started!</p>
      </div>
    );
  }

  return (
    <div className="chore-list">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned To</th>
            <th>Recurrence</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chores.map(chore => (
            <tr key={chore.id} className={chore.isGuild ? 'guild-chore' : ''}>
              <td>
                <strong>
                  {chore.isGuild && <span className="guild-badge-inline">⚔️</span>}
                  {chore.title}
                </strong>
                {chore.description && (
                  <span className="chore-description">{chore.description}</span>
                )}
              </td>
              <td>
                {chore.isGuild 
                  ? `${getTeamMemberName(chore.assignedTo)} + ${getTeamMemberName(chore.coAssignee)}`
                  : getTeamMemberName(chore.assignedTo)}
              </td>
              <td>
                <span className={`recurrence-badge ${chore.recurrence}`}>
                  {getRecurrenceLabel(chore.recurrence)}
                </span>
              </td>
              <td>{chore.startDate}</td>
              <td>{chore.dueDate || '-'}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => onEdit(chore)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${chore.title}"?`)) {
                      onDelete(chore.id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChoreList;
