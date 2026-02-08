import React from 'react';
import { useLiveFeed } from '../context/LiveFeedContext';

export default function LiveFeed() {
  const { liveFeed } = useLiveFeed();

  if (liveFeed.length === 0) {
    return null;
  }

  return (
    <div className="live-feed-container">
      <div className="live-feed-label">🎯 Live Activity</div>
      <div className="live-feed-ticker">
        {liveFeed.map((item) => (
          <div key={item.id} className={`feed-item ${item.status || 'in-progress'}`}>
            <span className="feed-member">{item.memberName}</span>
            <span className="feed-status">
              {item.status === 'completed' ? '✓' : '○'}
            </span>
            <span className="feed-task">{item.taskTitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
