import React, { useEffect, useState } from 'react';
import { generateMonthlyReview, getCompletedTasksForMonth } from '../utils/ReviewLogic';

const API_BASE = '/api';

export default function Reviews({ teamMembers, chores }) {
  const [reviews, setReviews] = useState([]);
  const [busy, setBusy] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      const data = await res.json();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const generateForMonth = async (year, month) => {
    if (!teamMembers || teamMembers.length === 0) {
      alert('Add team members before generating reviews.');
      return;
    }

    const confirmMsg = `Generate month-end reviews for ${teamMembers.length} pets for ${year}-${String(month+1).padStart(2,'0')}?`;
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);

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
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE' });
      if (res.status !== 204 && !res.ok) {
        console.error('Failed to delete review', await res.text());
      }
      await fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL reviews? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/all`, { method: 'DELETE' });
      if (!res.ok) console.error('Failed to delete all reviews', await res.text());
      await fetchReviews();
    } catch (err) {
      console.error('Failed to delete all reviews:', err);
    }
  };

  const now = new Date();

  return (
    <div className="reviews-view">
      <div className="view-header">
        <h2>Pet Reviews</h2>
        <div className="reviews-actions">
          <button onClick={() => generateForMonth(now.getFullYear(), now.getMonth())} disabled={busy} className="generate-btn">📅 Generate Month-End Reviews</button>
          <button onClick={handleDeleteAll} className="delete-all-btn">🗑️ Delete All Reviews</button>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 && <div className="empty">No reviews yet. Generate month-end reviews to get started.</div>}

        {reviews.map(r => {
          const member = teamMembers.find(m => m.id === r.memberId) || {};
          return (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{member.name || 'Unknown Pet'}</strong>
                <span className="review-meta">{r.monthYear || new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="review-body">{r.comment}</div>
              <div className="review-actions">
                <button className="delete-btn" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
