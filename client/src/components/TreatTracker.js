import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

function TreatTracker({ refreshTrigger = 0 }) {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockWarning, setLowStockWarning] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  useEffect(() => {
    console.log('TreatTracker: refreshTrigger changed to', refreshTrigger, '- fetching inventory');
    fetchInventory();
  }, [refreshTrigger]);

  // Also refetch every 2 seconds as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('TreatTracker: polling inventory');
      fetchInventory();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      // First sync inventory based on actual completed chores
      console.log('TreatTracker: syncing inventory...');
      const syncRes = await fetch(`${API_BASE}/inventory/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!syncRes.ok) throw new Error(`Sync failed: ${syncRes.status}`);
      const syncedData = await syncRes.json();
      console.log('TreatTracker: inventory synced, treats:', syncedData.treats);
      
      // Set the synced inventory directly
      setInventory(syncedData);
      
      // Check if low stock (below 10%)
      const percentageRemaining = (syncedData.treats / syncedData.maxTreats) * 100;
      console.log('TreatTracker: percentage remaining:', percentageRemaining);
      setLowStockWarning(percentageRemaining <= 10);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError(err.message);
      setLoading(false);
      // Set default inventory on error
      const defaultInventory = { treats: 100, maxTreats: 100 };
      setInventory(defaultInventory);
    }
  };

  const handleRefill = async () => {
    setIsRefilling(true);
    try {
      const res = await fetch(`${API_BASE}/inventory/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setInventory(data.inventory);
      setLowStockWarning(false);
    } catch (err) {
      console.error('Failed to refill:', err);
    } finally {
      setIsRefilling(false);
    }
  };

  if (!inventory && loading) {
    return (
      <div className="treat-tracker" style={{ minHeight: '120px' }}>
        <div className="treat-tracker-header">
          <h3>🍖 Treat-o-Meter</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontSize: '1rem' }}>
          Loading inventory...
        </div>
      </div>
    );
  }

  if (error && !inventory) {
    return (
      <div className="treat-tracker" style={{ minHeight: '120px', background: '#ffe0e0' }}>
        <div className="treat-tracker-header">
          <h3>🍖 Treat-o-Meter</h3>
        </div>
        <div style={{ padding: '1.5rem', color: '#d63031', fontSize: '0.95rem', fontWeight: '500' }}>
          ❌ Error loading inventory: {error}
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="treat-tracker" style={{ minHeight: '120px', background: '#f0f0f0' }}>
        <div className="treat-tracker-header">
          <h3>🍖 Treat-o-Meter</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '1rem' }}>
          No inventory data available
        </div>
      </div>
    );
  }

  const percentageRemaining = (inventory.treats / inventory.maxTreats) * 100;
  const barColor = percentageRemaining <= 10 ? '#ff6b6b' : 
                   percentageRemaining <= 25 ? '#ffa500' : 
                   '#4caf50';

  return (
    <div className="treat-tracker">
      <div className="treat-tracker-header">
        <h3>🍖 Treat-o-Meter</h3>
      </div>

    <div className="treat-jar-container">
        <div className={`treat-jar ${lowStockWarning ? 'shaking' : ''}`}>
          <div className="jar-label">Kibble Jar</div>
          <div className="jar-fill-container">
            <div
              className="jar-fill"
              style={{
                height: `${percentageRemaining}%`,
                backgroundColor: barColor
              }}
            />
          </div>
          <div className="jar-percentage">{Math.round(percentageRemaining)}%</div>
        </div>
        <div className="treat-stats">
          <div className="stat">
            <span className="stat-label">Treats Remaining</span>
            <span className="stat-value">{inventory.treats} / {inventory.maxTreats}</span>
          </div>
        </div>
      </div>

      {lowStockWarning && (
        <div className="low-stock-alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">
            Warning: Productivity will drop. Fuel reserves are low.
          </span>
        </div>
      )}

      <button
        className="refill-btn"
        onClick={handleRefill}
        disabled={isRefilling}
      >
        🔄 {isRefilling ? 'Refilling...' : 'Refill Jar'}
      </button>
    </div>
  );
}

export default TreatTracker;
