import React, { createContext, useState, useCallback } from 'react';

export const LiveFeedContext = createContext();

export function LiveFeedProvider({ children }) {
  const [liveFeed, setLiveFeed] = useState([]);

  const addFeedItem = useCallback((item) => {
    const feedItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...item
    };
    setLiveFeed(prev => [feedItem, ...prev].slice(0, 5)); // Keep last 5 items
  }, []);

  const clearFeed = useCallback(() => {
    setLiveFeed([]);
  }, []);

  const removeFeedItem = useCallback((id) => {
    setLiveFeed(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <LiveFeedContext.Provider value={{ liveFeed, addFeedItem, clearFeed, removeFeedItem }}>
      {children}
    </LiveFeedContext.Provider>
  );
}

export function useLiveFeed() {
  const context = React.useContext(LiveFeedContext);
  if (!context) {
    throw new Error('useLiveFeed must be used within a LiveFeedProvider');
  }
  return context;
}
