import React, { useState, useEffect } from 'react';

function ChoreForm({ chore, teamMembers, selectedDate, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    coAssignee: '',
    isGuild: false,
    recurrence: 'none',
    startDate: selectedDate.toISOString().split('T')[0],
    dueDate: ''
  });

  useEffect(() => {
    if (chore) {
      setFormData({
        title: chore.title || '',
        description: chore.description || '',
        assignedTo: chore.assignedTo || '',
        coAssignee: chore.coAssignee || '',
        isGuild: chore.isGuild || false,
        recurrence: chore.recurrence || 'none',
        startDate: chore.startDate || selectedDate.toISOString().split('T')[0],
        dueDate: chore.dueDate || ''
      });
    }
  }, [chore, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a chore title');
      return;
    }
    if (!formData.startDate) {
      alert('Please select a start date');
      return;
    }
    if (formData.isGuild && !formData.coAssignee) {
      alert('Guild chores require selecting a co-assignee');
      return;
    }
    onSave({
      ...formData,
      assignedTo: formData.assignedTo || null,
      coAssignee: formData.isGuild ? formData.coAssignee : null,
      dueDate: formData.dueDate || null
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{chore ? 'Edit Chore' : 'Add New Chore'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Clean the kitchen"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="isGuild">
              <input
                type="checkbox"
                id="isGuild"
                name="isGuild"
                checked={formData.isGuild}
                onChange={(e) => setFormData(prev => ({ ...prev, isGuild: e.target.checked }))}
              />
              {' '}Guild Task (co-op with another pet)
            </label>
          </div>

          {formData.isGuild && (
            <div className="form-group">
              <label htmlFor="coAssignee">Co-Assignee (Team Member 2) *</label>
              <select
                id="coAssignee"
                name="coAssignee"
                value={formData.coAssignee}
                onChange={handleChange}
              >
                <option value="">Select second team member</option>
                {teamMembers.filter(m => m.id !== formData.assignedTo).map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="recurrence">Recurrence</label>
            <select
              id="recurrence"
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">End Date (optional)</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {chore ? 'Update' : 'Create'} Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChoreForm;
