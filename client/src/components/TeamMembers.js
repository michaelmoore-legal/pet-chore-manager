import React, { useState, useRef } from 'react';
import { AVATAR_OPTIONS, PET_TEMPLATES } from '../utils/constants';
import { getAllSpecies } from '../utils/petChores';

const API_BASE = '/api';

function TeamMembers({ teamMembers, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: 'blue', photo: null, species: 'dog' });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500000) {
      alert('Photo must be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      if (editingMember) {
        await fetch(`${API_BASE}/team-members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_BASE}/team-members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      onUpdate();
      resetForm();
    } catch (err) {
      console.error('Failed to save team member:', err);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      avatar: member.avatar || 'blue',
      photo: member.photo || null,
      species: member.species || 'dog'
    });
    setShowForm(true);
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove "${member.name}" from the team? This will unassign them from any chores.`)) {
      return;
    }

    try {
      await fetch(`${API_BASE}/team-members/${member.id}`, {
        method: 'DELETE'
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to delete team member:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormData({ name: '', email: '', avatar: 'blue', photo: null, species: 'dog' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateRandomPet = async () => {
    try {
      // Pick a random species
      const species = Object.keys(PET_TEMPLATES)[Math.floor(Math.random() * Object.keys(PET_TEMPLATES).length)];
      const template = PET_TEMPLATES[species];
      
      // Pick a random name
      const randomName = template.names[Math.floor(Math.random() * template.names.length)];
      
      // Generate a random pet image URL from LoremFlickr
      const randomLock = Math.floor(Math.random() * 10000);
      const photoUrl = `https://loremflickr.com/200/200/${template.imageKeyword}?lock=${randomLock}`;
      
      // Create new pet object
      const newPet = {
        name: randomName,
        email: `${randomName.toLowerCase()}@pet-corp.com`,
        avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].id,
        photo: photoUrl,
        species: species,
        createdAt: new Date().toISOString()
      };
      
      // Add to backend
      const response = await fetch(`${API_BASE}/team-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      });
      
      if (!response.ok) throw new Error('Failed to create pet');
      
      // Refresh team members
      onUpdate();
    } catch (err) {
      console.error('Failed to generate random pet:', err);
      alert('Failed to create random pet. Please try again.');
    }
  };

  const getAvatarStyle = (avatarId) => {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
    return { background: avatar.color };
  };

  return (
    <div className="team-members">
      <div className="view-header">
        <h2>Pets</h2>
        <div className="header-buttons">
          <button className="create-pet-pad-btn" onClick={generateRandomPet}>
            🐾 Create New Pet
          </button>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Pet
          </button>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="empty-state">
          <p>No pets yet. Add pets to assign chores to them.</p>
        </div>
      ) : (
        <div className="member-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="member-card">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="member-avatar member-photo" />
              ) : (
                <div className="member-avatar" style={getAvatarStyle(member.avatar)}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="member-info">
                <h3>{member.name}</h3>
                {member.species && <p className="member-species">{member.species.charAt(0).toUpperCase() + member.species.slice(1)} 🐾</p>}
                {member.email && <p className="member-email">{member.email}</p>}
              </div>
              <div className="member-actions">
                <button className="edit-btn" onClick={() => handleEdit(member)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(member)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., john@company.com"
                />
              </div>

              <div className="form-group">
                <label>Profile Photo (optional)</label>
                <div className="photo-upload">
                  {formData.photo ? (
                    <div className="photo-preview">
                      <img src={formData.photo} alt="Preview" />
                      <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="photo-input-wrapper">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        id="photo-input"
                      />
                      <label htmlFor="photo-input" className="photo-input-label">
                        Choose Photo
                      </label>
                      <span className="photo-hint">Max 500KB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Profile Color {formData.photo && '(used as fallback)'}</label>
                <div className="avatar-picker">
                  {AVATAR_OPTIONS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`avatar-option ${formData.avatar === avatar.id ? 'selected' : ''}`}
                      style={{ background: avatar.color }}
                      onClick={() => setFormData(prev => ({ ...prev, avatar: avatar.id }))}
                      title={avatar.id}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="species">Pet Species 🐾</label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                >
                  {getAllSpecies().map(species => (
                    <option key={species} value={species}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;
