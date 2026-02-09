import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAvatarColor } from '../utils/constants';
import { choreOccursOnDate } from '../utils/dateUtils';
import { generateWeeklyReview, calculateManagerGrade, generateMonthlyReview, getCompletedTasksForMonth } from '../utils/ReviewLogic';
import TreatTracker from './TreatTracker';
import PetCelebration from './PetCelebration';

const API_BASE = '/api';

/**
 * Calculate relative grade based on ranking among peers
 * A = top performer, F = lowest performer
 */
const calculateRelativeGrade = (memberIndex, totalMembers, completedCount) => {
  // If nobody completed anything, everyone gets N/A
  if (completedCount === 0 && totalMembers > 0 && memberIndex > 0) {
    return {
      grade: 'N/A',
      percentage: 0,
      color: '#999',
      description: 'No tasks completed'
    };
  }

  // Rank position: 0 = best, totalMembers-1 = worst
  const percentileRank = memberIndex / (totalMembers || 1);

  let grade, color, description;

  if (percentileRank === 0) {
    grade = 'A';
    color = '#2ecc71';
    description = 'Top Performer';
  } else if (percentileRank <= 0.2) {
    grade = 'B';
    color = '#3498db';
    description = 'Strong Performance';
  } else if (percentileRank <= 0.4) {
    grade = 'C';
    color = '#f39c12';
    description = 'Average Performance';
  } else if (percentileRank <= 0.6) {
    grade = 'D';
    color = '#e67e22';
    description = 'Below Average';
  } else if (percentileRank < 1) {
    grade = 'F';
    color = '#c0392b';
    description = 'Needs Improvement';
  } else {
    grade = 'N/A';
    color = '#999';
    description = 'No data';
  }

  return { grade, percentage: 0, color, description };
};

function Statistics({ chores, teamMembers, settings, onUpdateSettings }) {
  const [period, setPeriod] = useState('month'); // 'week' or 'month'
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewData, setEditingReviewData] = useState({ rating: 5, comment: '' });
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [inventoryRefresh, setInventoryRefresh] = useState(0);
  const [monthlyReviewsGenerated, setMonthlyReviewsGenerated] = useState(false);
  const [lastProcessedMonthKey, setLastProcessedMonthKey] = useState(null);
  const [monthEndCelebration, setMonthEndCelebration] = useState(null);

  // State for calculated values
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [completedCounts, setCompletedCounts] = useState({});
  const [taskCounts, setTaskCounts] = useState({});
  const [employeeOfPeriod, setEmployeeOfPeriod] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Detect month transitions and generate reviews for previous month
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${currentMonth}`;

    if (lastProcessedMonthKey === null) {
      // First load - just set the current month key
      setLastProcessedMonthKey(currentMonthKey);
    }
  }, []);

  // Check for month transitions periodically
  useEffect(() => {
    if (period !== 'month' || lastProcessedMonthKey === null) return;

    const checkMonthTransition = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentMonthKey = `${currentYear}-${currentMonth}`;

      if (lastProcessedMonthKey !== currentMonthKey) {
        // Month has changed - generate reviews for the PREVIOUS month
        const prevDate = new Date(now);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();
        const prevMonthKey = `${prevYear}-${prevMonth}`;

        generatePreviousMonthReviewsAndCelebration(prevYear, prevMonth, prevMonthKey);
        setLastProcessedMonthKey(currentMonthKey);
      }
    };

    // Check immediately
    checkMonthTransition();

    // Then check every 60 seconds
    const interval = setInterval(checkMonthTransition, 60000);
    return () => clearInterval(interval);
  }, [period, lastProcessedMonthKey, teamMembers, chores, reviews]);

  // Generate monthly reviews after they're fetched
  useEffect(() => {
    if (reviews.length > 0 && !monthlyReviewsGenerated && teamMembers.length > 0) {
      generateMonthlyReviewsIfNeeded();
      setMonthlyReviewsGenerated(true);
    }
  }, [reviews, teamMembers, chores]);

  // Refresh inventory when chores change (for treat stealing)
  useEffect(() => {
    setInventoryRefresh(prev => prev + 1);
  }, [chores]);

  // Generate monthly reviews for current month
  const generateForMonth = useCallback(async (year, month) => {
    if (!teamMembers || teamMembers.length === 0) {
      alert('Add team members before generating reviews.');
      return;
    }

    const confirmMsg = `Generate month-end reviews for ${teamMembers.length} pets for ${year}-${String(month+1).padStart(2,'0')}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      for (const member of teamMembers) {
        const completed = getCompletedTasksForMonth(chores, member.id, year, month);
        const comment = generateMonthlyReview(member.name, member.species, completed);
        const monthYear = `${year}-${String(month+1).padStart(2,'0')}`;

        const res = await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id, comment, isMonthlyAudit: true, monthYear })
        });

        if (!res.ok) {
          console.error('Failed to create review for', member.name, await res.text());
        }
      }

      await fetchReviews();
      alert('Monthly reviews generated!');
    } catch (err) {
      console.error('Error generating reviews:', err);
      alert('Error generating reviews. Check console.');
    }
  }, [teamMembers, chores]);

  // Generate monthly automated reviews if they don't exist for this month
  const generateMonthlyReviewsIfNeeded = async () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;

    // Check which members already have monthly reviews for this month
    const membersNeedingReview = teamMembers.filter(member => {
      const hasMonthlyReview = reviews.some(r => 
        r.memberId === member.id && 
        r.isMonthlyAudit && 
        r.monthYear === monthKey
      );
      return !hasMonthlyReview;
    });

    if (membersNeedingReview.length === 0) return;

    // Generate and submit reviews for members who need them
    for (const member of membersNeedingReview) {
      const completedTasks = getCompletedTasksForMonth(chores, member.id, currentYear, currentMonth);
      const review = generateMonthlyReview(member.name, member.species, completedTasks);
      
      try {
        await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            rating: 5,
            comment: review,
            isMonthlyAudit: true,
            monthYear: monthKey
          })
        });
      } catch (err) {
        console.error(`Failed to create monthly review for ${member.name}:`, err);
      }
    }

    // Refresh reviews after generating new ones
    if (membersNeedingReview.length > 0) {
      setTimeout(fetchReviews, 500);
    }
  };

  // Helper function to calculate winner for a specific month
  const getPreviousMonthWinner = (year, month) => {
    const monthStart = new Date(year, month, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const counts = {};
    teamMembers.forEach(member => {
      counts[member.id] = 0;
    });

    if (!Array.isArray(chores)) return null;

    const currentDate = new Date(monthStart);
    while (currentDate <= monthEnd) {
      const dateStr = currentDate.toISOString().split('T')[0];
      chores.forEach(chore => {
        if (choreOccursOnDate(chore, currentDate) && chore.completedDates?.includes(dateStr)) {
          if (chore.isGuild && chore.assignedTo && chore.coAssignee) {
            if (counts[chore.assignedTo] !== undefined) counts[chore.assignedTo] += 0.5;
            if (counts[chore.coAssignee] !== undefined) counts[chore.coAssignee] += 0.5;
          } else if (chore.assignedTo && counts[chore.assignedTo] !== undefined) {
            counts[chore.assignedTo]++;
          }
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let maxCompleted = 0;
    let winner = null;
    teamMembers.forEach(member => {
      if ((counts[member.id] || 0) > maxCompleted) {
        maxCompleted = counts[member.id] || 0;
        winner = member;
      }
    });

    return maxCompleted > 0 ? { member: winner, count: maxCompleted } : null;
  };

  // Generate reviews for previous month and trigger celebration
  const generatePreviousMonthReviewsAndCelebration = async (year, month, prevMonthKey) => {
    const membersNeedingReview = teamMembers.filter(member => {
      const hasMonthlyReview = reviews.some(r => 
        r.memberId === member.id && 
        r.isMonthlyAudit && 
        r.monthYear === prevMonthKey
      );
      return !hasMonthlyReview;
    });

    if (membersNeedingReview.length === 0) {
      // Reviews already exist, just show the celebration
      const winner = getPreviousMonthWinner(year, month);
      if (winner) {
        setMonthEndCelebration({ ...winner, species: winner.member.species });
      }
      return;
    }

    // Generate reviews for all members for the previous month
    for (const member of membersNeedingReview) {
      const completedTasks = getCompletedTasksForMonth(chores, member.id, year, month);
      const review = generateMonthlyReview(member.name, member.species, completedTasks);
      
      try {
        await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            rating: 5,
            comment: review,
            isMonthlyAudit: true,
            monthYear: prevMonthKey
          })
        });
      } catch (err) {
        console.error(`Failed to create monthly review for ${member.name}:`, err);
      }
    }

    // Refresh reviews and show celebration
    setTimeout(() => {
      fetchReviews();
      const winner = getPreviousMonthWinner(year, month);
      if (winner) {
        setMonthEndCelebration({ ...winner, species: winner.member.species });
      }
    }, 500);
  };

  // Clear all reviews
  const handleClearAllReviews = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reviews for all animals? This cannot be undone.')) return;
    
    try {
      await fetch(`${API_BASE}/reviews/all`, {
        method: 'DELETE'
      });
      await fetchReviews(); // Wait for reviews to be fetched
      setMonthlyReviewsGenerated(false); // Reset flag so monthly reviews can be regenerated
    } catch (err) {
      console.error('Failed to clear reviews:', err);
    }
  };

  // Recalculate everything when period, chores, or teamMembers change
  useEffect(() => {
    // Calculate date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start, end;

    if (period === 'week') {
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    setDateRange({ start, end });

    // Calculate completed counts
    const newCompletedCounts = {};
    teamMembers.forEach(member => {
      newCompletedCounts[member.id] = 0;
    });

    const currentDateCompleted = new Date(start);
    while (currentDateCompleted <= end) {
      const dateStr = currentDateCompleted.toISOString().split('T')[0];
      chores.forEach(chore => {
        if (choreOccursOnDate(chore, currentDateCompleted) &&
            chore.completedDates?.includes(dateStr)) {
          // For guild chores, split credit evenly between assignees
          if (chore.isGuild && chore.assignedTo && chore.coAssignee) {
            if (newCompletedCounts[chore.assignedTo] !== undefined) {
              newCompletedCounts[chore.assignedTo] += 0.5;
            }
            if (newCompletedCounts[chore.coAssignee] !== undefined) {
              newCompletedCounts[chore.coAssignee] += 0.5;
            }
          } else if (chore.assignedTo && newCompletedCounts[chore.assignedTo] !== undefined) {
            // Regular chores count as 1 for the single assignee
            newCompletedCounts[chore.assignedTo]++;
          }
        }
      });
      currentDateCompleted.setDate(currentDateCompleted.getDate() + 1);
    }
    
    // Only update state if values actually changed
    setCompletedCounts(prev => {
      const changed = Object.keys(newCompletedCounts).some(key => prev[key] !== newCompletedCounts[key]);
      return changed ? newCompletedCounts : prev;
    });

    // Calculate task counts
    const newTaskCounts = {};
    teamMembers.forEach(member => {
      newTaskCounts[member.id] = 0;
    });
    newTaskCounts['unassigned'] = 0;

    const currentDateTasks = new Date(start);
    while (currentDateTasks <= end) {
      chores.forEach(chore => {
        if (choreOccursOnDate(chore, currentDateTasks)) {
          // Guild chores count toward both members' task counts
          if (chore.isGuild && chore.assignedTo && chore.coAssignee) {
            if (newTaskCounts[chore.assignedTo] !== undefined) {
              newTaskCounts[chore.assignedTo]++;
            }
            if (newTaskCounts[chore.coAssignee] !== undefined) {
              newTaskCounts[chore.coAssignee]++;
            }
          } else if (chore.assignedTo && newTaskCounts[chore.assignedTo] !== undefined) {
            newTaskCounts[chore.assignedTo]++;
          } else {
            newTaskCounts['unassigned']++;
          }
        }
      });
      currentDateTasks.setDate(currentDateTasks.getDate() + 1);
    }
    
    // Only update state if values actually changed
    setTaskCounts(prev => {
      const changed = Object.keys(newTaskCounts).some(key => prev[key] !== newTaskCounts[key]);
      return changed ? newTaskCounts : prev;
    });

    // Calculate employee of period
    let maxCompleted = 0;
    let winner = null;

    teamMembers.forEach(member => {
      const completed = newCompletedCounts[member.id] || 0;
      if (completed > maxCompleted) {
        maxCompleted = completed;
        winner = member;
      }
    });

    const newWinner = maxCompleted > 0 ? { member: winner, count: maxCompleted } : null;
    
    // Only update state if winner actually changed
    setEmployeeOfPeriod(prev => {
      if (!prev && !newWinner) return prev;
      if (prev?.member?.id !== newWinner?.member?.id) return newWinner;
      return prev;
    });

  }, [period, chores, teamMembers]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  // Calculate maxCount for bar width proportions - based on max completed tasks
  const maxCompletedCount = Math.max(
    ...teamMembers.map(member => completedCounts[member.id] || 0),
    1
  );

  const formatDateRange = () => {
    const options = { month: 'short', day: 'numeric' };
    const startStr = dateRange.start.toLocaleDateString('en-US', options);
    const endStr = dateRange.end.toLocaleDateString('en-US', options);
    const year = dateRange.end.getFullYear();
    return `${startStr} - ${endStr}, ${year}`;
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedMember || !reviewForm.comment.trim()) return;

    try {
      await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        })
      });
      fetchReviews();
      setShowReviewForm(false);
      setSelectedMember(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await fetch(`${API_BASE}/reviews/${reviewId}`, { method: 'DELETE' });
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const startEditingReview = (review) => {
    setEditingReviewId(review.id);
    setEditingReviewData({ rating: review.rating, comment: review.comment });
  };

  const cancelEditingReview = () => {
    setEditingReviewId(null);
    setEditingReviewData({ rating: 5, comment: '' });
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editingReviewData.comment.trim()) return;
    try {
      await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editingReviewData.rating,
          comment: editingReviewData.comment.trim()
        })
      });
      fetchReviews();
      cancelEditingReview();
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  const getMemberById = (id) => teamMembers.find(m => m.id === id);

  const getReviewsForMember = (memberId) => {
    return reviews.filter(r => r.memberId === memberId).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          >
            {star <= rating ? '\u2605' : '\u2606'}
          </span>
        ))}
      </div>
    );
  };

  const getLeaderboardTitle = () => {
    if (period === 'week') {
      return settings?.leaderboardTitleWeek || 'Employee of the Week';
    }
    return settings?.leaderboardTitleMonth || 'Employee of the Month';
  };

  const startEditingTitle = () => {
    setTempTitle(getLeaderboardTitle());
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!tempTitle.trim()) {
      setEditingTitle(false);
      return;
    }
    const settingKey = period === 'week' ? 'leaderboardTitleWeek' : 'leaderboardTitleMonth';
    if (onUpdateSettings) {
      await onUpdateSettings({ [settingKey]: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  return (
    <div className="statistics">
      {/* Pet Celebration Animation - Only show on month transition for previous month winner */}
      {monthEndCelebration && <PetCelebration winner={monthEndCelebration} onComplete={() => setMonthEndCelebration(null)} />}

      {/* Calculate total completed tasks for empty state check */}
      {(() => {
        const totalCompleted = Object.values(completedCounts).reduce((sum, count) => sum + count, 0);
        if (totalCompleted === 0) {
          return (
            <div className="empty-stats-state">
              <div className="empty-icon">🏖️</div>
              <h3>No completed tasks yet.</h3>
              <p>The pets are currently being suspiciously well-behaved...</p>
              <p className="empty-hint">Try clicking <strong>⚡ Chaos Mode</strong> to shake things up!</p>
            </div>
          );
        }
        return null;
      })()}

      {/* Employee of the Period Banner */}
      {employeeOfPeriod && (
        <div className="employee-of-month" key={`winner-${period}-${employeeOfPeriod.member.id}`}>
          <div className="eom-trophy">{'\uD83C\uDFC6'}</div>
          <div className="eom-content">
            {editingTitle ? (
              <div className="eom-title-edit">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setEditingTitle(false);
                  }}
                  autoFocus
                />
                <button className="eom-save-btn" onClick={handleSaveTitle}>Save</button>
                <button className="eom-cancel-btn" onClick={() => setEditingTitle(false)}>Cancel</button>
              </div>
            ) : (
              <h3 className="eom-title-editable" onClick={startEditingTitle} title="Click to edit">
                {getLeaderboardTitle()}
              </h3>
            )}
            <div className="eom-winner">
              {employeeOfPeriod.member.photo ? (
                <img src={employeeOfPeriod.member.photo} alt="" className="eom-avatar" />
              ) : (
                <div
                  className="eom-avatar-placeholder"
                  style={{ backgroundColor: getAvatarColor(employeeOfPeriod.member.avatar) }}
                >
                  {employeeOfPeriod.member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="eom-info">
                <span className="eom-name">{employeeOfPeriod.member.name}</span>
                <span className="eom-stats">{employeeOfPeriod.count} tasks completed!</span>
              </div>
            </div>
          </div>
          <div className="eom-trophy">{'\uD83C\uDFC6'}</div>
        </div>
      )}

      <TreatTracker refreshTrigger={inventoryRefresh} />

      <div className="view-header">
        <h2>Task Distribution</h2>
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            This Week
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="stats-period-label">{formatDateRange()}</div>

      <div className="histogram-container" key={`histogram-${period}`}>
        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <p>No team members yet. Add team members to see task distribution.</p>
          </div>
        ) : (
          <div className="histogram">
            {teamMembers.map(member => {
              const count = taskCounts[member.id] || 0;
              const completed = completedCounts[member.id] || 0;
              const percentage = maxCompletedCount > 0 ? (completed / maxCompletedCount) * 100 : 0;
              // For zero completed tasks, show a minimal bar, otherwise show proportional width
              const barWidth = completed === 0 ? 2 : Math.max(percentage, 5);
              const color = getAvatarColor(member.avatar);
              const isWinner = employeeOfPeriod?.member?.id === member.id;

              return (
                <div key={member.id} className={`histogram-row ${isWinner ? 'winner' : ''}`}>
                  <div className="histogram-label">
                    {isWinner && <span className="mini-trophy">{'\uD83C\uDFC6'}</span>}
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="histogram-avatar" />
                    ) : (
                      <div className="histogram-avatar-placeholder" style={{ backgroundColor: color }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="histogram-name">{member.name}</span>
                  </div>
                  <div className="histogram-bar-container">
                    <div
                      className={`histogram-bar ${completed === 0 ? 'zero-tasks' : ''}`}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: color
                      }}
                    >
                      {member.photo && completed > 0 && (
                        <img src={member.photo} alt="" className="histogram-bar-photo" />
                      )}
                    </div>
                    <span className="histogram-count">{completed}/{count}</span>
                  </div>
                </div>
              );
            })}

            {(taskCounts['unassigned'] || 0) > 0 && (
              <div className="histogram-row">
                <div className="histogram-label">
                  <div className="histogram-avatar-placeholder" style={{ backgroundColor: '#888' }}>
                    ?
                  </div>
                  <span className="histogram-name">Unassigned</span>
                </div>
                <div className="histogram-bar-container">
                  <div
                    className="histogram-bar"
                    style={{
                      width: `${Math.max((taskCounts['unassigned'] / maxCount) * 100, 2)}%`,
                      backgroundColor: '#888'
                    }}
                  />
                  <span className="histogram-count">{taskCounts['unassigned']}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="stats-summary">
        <div className="stats-card">
          <div className="stats-number">
            {Object.entries(completedCounts).reduce((sum, [key, val]) => sum + (typeof val === 'number' ? val : 0), 0)}
          </div>
          <div className="stats-label">Completed</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">
            {Object.entries(taskCounts).reduce((sum, [key, val]) => sum + (typeof val === 'number' ? val : 0), 0)}
          </div>
          <div className="stats-label">Total Tasks</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{teamMembers.length}</div>
          <div className="stats-label">Team Members</div>
        </div>
      </div>

      {/* Weekly Performance Review Section */}
      {period === 'week' && (
        <div className="weekly-performance-section">
          <div className="view-header">
            <h2>📈 Weekly Performance Review</h2>
          </div>

          {teamMembers.length === 0 ? (
            <div className="empty-state">
              <p>Add team members to generate performance reviews.</p>
            </div>
          ) : (
            <div className="performance-reviews-grid">
              {teamMembers.map((member) => {
                const completedLastWeek = completedCounts[member.id] || 0;
                const tasksLastWeek = taskCounts[member.id] || 0;
                const review = generateWeeklyReview(member.name, member.species, Math.round(completedLastWeek));
                const gradeData = calculateManagerGrade(completedLastWeek, tasksLastWeek);
                const color = getAvatarColor(member.avatar);

                return (
                  <div key={`perf-${member.id}`} className="performance-review-card" style={{ borderLeftColor: color }}>
                    <div className="perf-header">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="perf-avatar" />
                      ) : (
                        <div className="perf-avatar-placeholder" style={{ backgroundColor: color }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="perf-member-info">
                        <span className="perf-name">{member.name}</span>
                        <span className="perf-species">({member.species})</span>
                      </div>
                      <div className="manager-grade" style={{ backgroundColor: gradeData.color }}>
                        <div className="grade-letter">{gradeData.grade}</div>
                        <div className="grade-description">{gradeData.description}</div>
                      </div>
                    </div>
                    <div className="perf-review-text">
                      <p>"{review}"</p>
                    </div>
                    <div className="perf-stats">
                      <span>Tasks Completed: <strong>{completedLastWeek}/{tasksLastWeek}</strong></span>
                      <span>Completion Rate: <strong>{gradeData.percentage}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Performance Reviews Section */}
      <div className="reviews-section">
        <div className="view-header">
          <h2>Performance Reviews</h2>
          <div className="header-buttons">
            <button
              className="add-btn"
              onClick={() => setShowReviewForm(true)}
            >
              + Add Review
            </button>
            <button
              className="generate-btn"
              onClick={() => {
                const now = new Date();
                generateForMonth(now.getFullYear(), now.getMonth());
              }}
              title="Generate humorous month-end reviews for all pets"
            >
              📅 Create Monthly Reviews
            </button>
            <button
              className="delete-all-btn"
              onClick={handleClearAllReviews}
              title="Delete all reviews for all animals"
            >
              🗑️ Delete All Reviews
            </button>
          </div>
        </div>

        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <p>Add team members to write performance reviews.</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {useMemo(() => {
              // Sort members by completed count (descending) for relative grading
              const sortedMembers = [...teamMembers].sort((a, b) => 
                (completedCounts[b.id] || 0) - (completedCounts[a.id] || 0)
              );

              return sortedMembers.map((member, rankIndex) => {
                const memberReviews = getReviewsForMember(member.id);
                const color = getAvatarColor(member.avatar);
                const isWinner = employeeOfPeriod?.member?.id === member.id;
                const gradeData = calculateRelativeGrade(rankIndex, teamMembers.length, completedCounts[member.id] || 0);

                return (
                  <div key={member.id} className="review-card">
                    <div className="review-card-header" style={{ borderLeftColor: color }}>
                      {isWinner && <span className="card-trophy">{'\uD83C\uDFC6'}</span>}
                      {member.photo ? (
                        <img src={member.photo} alt="" className="review-avatar" />
                      ) : (
                        <div className="review-avatar-placeholder" style={{ backgroundColor: color }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="review-member-info">
                        <h4>{member.name}</h4>
                        <span className="review-stats">
                          {completedCounts[member.id] || 0} tasks completed this {period}
                        </span>
                      </div>
                      <div className="review-card-grade" style={{ backgroundColor: gradeData.color }}>
                        <div className="card-grade-letter">{gradeData.grade}</div>
                      </div>
                      <button
                        className="add-review-btn"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowReviewForm(true);
                        }}
                      >
                        + Review
                      </button>
                    </div>

                    {memberReviews.length === 0 ? (
                      <p className="no-reviews">No reviews yet</p>
                    ) : (
                      <div className="review-list">
                        {memberReviews.map(review => (
                          <div key={review.id} className="review-item">
                            {editingReviewId === review.id ? (
                              <div className="review-edit-form">
                                <div className="edit-form-group">
                                  <label>Rating</label>
                                  {renderStars(editingReviewData.rating, true, (r) => 
                                    setEditingReviewData(f => ({ ...f, rating: r }))
                                  )}
                                </div>
                                <div className="edit-form-group">
                                  <label>Comment</label>
                                  <textarea
                                    value={editingReviewData.comment}
                                    onChange={(e) => setEditingReviewData(f => ({ ...f, comment: e.target.value }))}
                                    rows="3"
                                    required
                                  />
                                </div>
                                <div className="review-edit-actions">
                                  <button
                                    className="save-edit-btn"
                                    onClick={() => handleUpdateReview(review.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="cancel-edit-btn"
                                    onClick={cancelEditingReview}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {renderStars(review.rating)}
                                {review.isMonthlyAudit && (
                                  <div className="review-audit-badge">📋 Monthly Audit</div>
                                )}
                                <p className="review-comment">{review.comment}</p>
                                <div className="review-meta">
                                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                  <div className="review-actions">
                                    {!review.isMonthlyAudit && (
                                      <button
                                        className="edit-review-btn"
                                        onClick={() => startEditingReview(review)}
                                      >
                                        Edit
                                      </button>
                                    )}
                                    <button
                                      className="delete-review-btn"
                                      onClick={() => handleDeleteReview(review.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            }, [teamMembers, completedCounts, editingReviewId, reviews])}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Write Performance Review</h2>
            <form onSubmit={handleAddReview}>
              <div className="form-group">
                <label>Team Member</label>
                <select
                  value={selectedMember?.id || ''}
                  onChange={(e) => setSelectedMember(getMemberById(e.target.value))}
                  required
                >
                  <option value="">Select a team member...</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rating</label>
                {renderStars(reviewForm.rating, true, (r) => setReviewForm(f => ({ ...f, rating: r })))}
              </div>

              <div className="form-group">
                <label>Review Comments</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="e.g., Shows great initiative in the Treat Procurement department, but needs to work on 'Quiet During Zoom Calls' KPIs..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;
