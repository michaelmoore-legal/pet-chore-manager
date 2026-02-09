import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import ChoreForm from './components/ChoreForm';
import ChoreList from './components/ChoreList';
import TeamMembers from './components/TeamMembers';
import Statistics from './components/Statistics';
import LiveFeed from './components/LiveFeed';
import { runChaosSimulation } from './utils/simulator';
import { LiveFeedProvider, useLiveFeed } from './context/LiveFeedContext';
import './App.css';

const API_BASE = '/api';

function AppContent() {
  const { addFeedItem } = useLiveFeed();
  const [chores, setChores] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [settings, setSettings] = useState({ calendarName: 'Pet Task Manager' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [editingChore, setEditingChore] = useState(null);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [editingCalendarName, setEditingCalendarName] = useState(false);
  const [tempCalendarName, setTempCalendarName] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchChores();
    fetchTeamMembers();
    fetchSettings();
  }, []);

  const fetchChores = async () => {
    try {
      const res = await fetch(`${API_BASE}/chores`);
      const data = await res.json();
      setChores(data);
    } catch (err) {
      console.error('Failed to fetch chores:', err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/team-members`);
      const data = await res.json();
      setTeamMembers(data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSaveCalendarName = async () => {
    if (!tempCalendarName.trim()) {
      setEditingCalendarName(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarName: tempCalendarName.trim() })
      });
      const data = await res.json();
      setSettings(data);
      setEditingCalendarName(false);
    } catch (err) {
      console.error('Failed to save calendar name:', err);
    }
  };

  const startEditingCalendarName = () => {
    setTempCalendarName(settings.calendarName);
    setEditingCalendarName(true);
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleSaveChore = async (choreData) => {
    try {
      if (editingChore) {
        const res = await fetch(`${API_BASE}/chores/${editingChore.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(choreData)
        });
        const updated = await res.json();
        setChores(chores.map(c => c.id === updated.id ? updated : c));
      } else {
        const res = await fetch(`${API_BASE}/chores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(choreData)
        });
        const newChore = await res.json();
        setChores([...chores, newChore]);
      }
      setShowChoreForm(false);
      setEditingChore(null);
    } catch (err) {
      console.error('Failed to save chore:', err);
    }
  };

  const handleDeleteChore = async (choreId) => {
    try {
      await fetch(`${API_BASE}/chores/${choreId}`, { method: 'DELETE' });
      setChores(chores.filter(c => c.id !== choreId));
    } catch (err) {
      console.error('Failed to delete chore:', err);
    }
  };

  const handleToggleComplete = async (chore, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isCompleted = chore.completedDates?.includes(dateStr);
    console.log(`Toggle complete: ${chore.title} on ${dateStr}, currently completed: ${isCompleted}`);

    try {
      const endpoint = isCompleted ? 'uncomplete' : 'complete';
      const res = await fetch(`${API_BASE}/chores/${chore.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr })
      });
      const response = await res.json();
      console.log('Toggle complete response:', response);
      
      // Handle new response format with chore and inventory
      const updatedChore = response.chore || response;
      console.log('Updated chore:', updatedChore);
      setChores(chores.map(c => c.id === updatedChore.id ? updatedChore : c));
      
      if (response.inventory) {
        console.log('Inventory in response:', response.inventory);
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleEditChore = (chore) => {
    setEditingChore(chore);
    setShowChoreForm(true);
  };

  const handleAddChore = () => {
    setEditingChore(null);
    setShowChoreForm(true);
  };

  const handleStartChaosMode = async () => {
    if (!teamMembers.length) {
      alert('Please add team members first');
      return;
    }

    setIsSimulating(true);
    const today = new Date();

    try {
      await runChaosSimulation(
        teamMembers,
        null, // No longer needs chore library - uses species-based tasks
        today.getMonth(),
        today.getFullYear(),
        // onTaskCreated callback
        async (newChore, callbacks) => {
          const res = await fetch(`${API_BASE}/chores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newChore)
          });
          if (!res.ok) throw new Error(`Failed to create chore: ${res.status}`);
          const createdChore = await res.json();
          setChores(prev => [...prev, createdChore]);
          
          // Get the member name for display
          const member = teamMembers.find(m => m.id === createdChore.assignedTo);
          const memberName = member ? member.name : 'Unknown';
          
          // Add to live feed - task created and waiting for completion
          addFeedItem({
            memberName,
            taskTitle: createdChore.title,
            status: 'in-progress'
          });
          
          // Handle 3-second completion lag with 66% completion rate
          const shouldComplete = Math.random() < 0.66;
          setTimeout(() => {
            if (shouldComplete) {
              // Mark as completed on the scheduled date
              const completionDate = createdChore.startDate; // Use the scheduled date
              const updatedCompletedDates = [...(createdChore.completedDates || []), completionDate];
              fetch(`${API_BASE}/chores/${createdChore.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedDates: updatedCompletedDates, completed: true })
              }).then(res => res.json()).then(updated => {
                setChores(prev => prev.map(c => c.id === updated.id ? updated : c));
                // Update live feed to show completion
                addFeedItem({
                  memberName,
                  taskTitle: createdChore.title,
                  status: 'completed'
                });
                
                // HEIST MODE: If this was a treat theft, deduct from inventory
                if (createdChore.isHeist) {
                  console.log(`🍖 HEIST REWARD: ${memberName} successfully stole treats!`);
                  // Trigger inventory sync/update
                  fetch(`${API_BASE}/inventory/sync`, { method: 'POST' })
                    .then(res => res.json())
                    .catch(err => console.error('Failed to sync inventory:', err));
                }
              });
            } else {
              // Task abandoned/failed
              addFeedItem({
                memberName,
                taskTitle: createdChore.title,
                status: 'abandoned'
              });
            }
          }, 3000);
        },
        // onSimulationComplete callback
        () => {
          setIsSimulating(false);
          alert('🎉 Chaos Mode Complete! Check your species-specific stats!');
        }
      );
    } catch (err) {
      console.error('Chaos Mode error:', err);
      setIsSimulating(false);
      alert('Chaos Mode encountered an error. Check console.');
    }
  };

  const handleClearCalendar = async () => {
    const confirmClear = window.confirm(
      '⚠️ Are you sure you want to clear the calendar?\n\nThis will delete all chore instances, but the task types remain available in Chaos Mode.'
    );

    if (!confirmClear) return;

    try {
      // Delete all chores from the calendar
      for (const chore of chores) {
        const res = await fetch(`${API_BASE}/chores/${chore.id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          console.error(`Failed to delete chore ${chore.id}`);
        }
      }

      // Clear local state - all chores removed from calendar
      setChores([]);
      console.log('🗑️ Calendar cleared. All chore instances deleted. Task types remain ready for Chaos Mode.');
      alert('✨ Calendar cleared! All tasks removed. Task types are still available.');
    } catch (err) {
      console.error('Failed to clear calendar:', err);
      alert('Error clearing calendar. Check console.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          {editingCalendarName ? (
            <div className="calendar-name-edit">
              <input
                type="text"
                value={tempCalendarName}
                onChange={(e) => setTempCalendarName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCalendarName();
                  if (e.key === 'Escape') setEditingCalendarName(false);
                }}
                autoFocus
              />
              <button className="save-name-btn" onClick={handleSaveCalendarName}>Save</button>
              <button className="cancel-name-btn" onClick={() => setEditingCalendarName(false)}>Cancel</button>
            </div>
          ) : (
            <h1 onClick={startEditingCalendarName} className="editable-title" title="Click to edit">
              {settings.calendarName}
            </h1>
          )}
        </div>
        <nav className="tab-nav">
          <button
            className={activeTab === 'calendar' ? 'active' : ''}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button
            className={activeTab === 'chores' ? 'active' : ''}
            onClick={() => setActiveTab('chores')}
          >
            All Chores
          </button>
          <button
            className={activeTab === 'team' ? 'active' : ''}
            onClick={() => setActiveTab('team')}
          >
            Team Members
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="add-btn" onClick={handleAddChore}>+ Add Chore</button>
              <button 
                className="chaos-btn" 
                onClick={handleStartChaosMode}
                disabled={isSimulating}
                title="Generate random tasks for the month (takes time to animate)"
              >
                {isSimulating ? '⚡ Chaos Running...' : '⚡ Chaos Mode'}
              </button>
              <button 
                className="clear-btn" 
                onClick={handleClearCalendar}
                title="Remove all scheduled dates but keep task types for Chaos Mode"
              >
                🗑️ Clear Calendar
              </button>
            </div>
            <LiveFeed />
            <Calendar
              chores={chores}
              teamMembers={teamMembers}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onToggleComplete={handleToggleComplete}
              onEditChore={handleEditChore}
            />
          </div>
        )}

        {activeTab === 'chores' && (
          <div className="chores-view">
            <div className="view-header">
              <h2>All Chores</h2>
              <button className="add-btn" onClick={handleAddChore}>+ Add Chore</button>
            </div>
            <ChoreList
              chores={chores}
              teamMembers={teamMembers}
              onEdit={handleEditChore}
              onDelete={handleDeleteChore}
            />
          </div>
        )}

        {activeTab === 'team' && (
          <TeamMembers
            teamMembers={teamMembers}
            onUpdate={fetchTeamMembers}
          />
        )}

        {activeTab === 'stats' && (
          <Statistics
            chores={chores}
            teamMembers={teamMembers}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {showChoreForm && (
        <ChoreForm
          chore={editingChore}
          teamMembers={teamMembers}
          selectedDate={selectedDate}
          onSave={handleSaveChore}
          onCancel={() => {
            setShowChoreForm(false);
            setEditingChore(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LiveFeedProvider>
      <AppContent />
    </LiveFeedProvider>
  );
}
