const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Initialize data file if it doesn't exist
const defaultData = {
  settings: {
    calendarName: 'Office Chores Manager',
    leaderboardTitleWeek: 'Employee of the Week',
    leaderboardTitleMonth: 'Employee of the Month'
  },
  teamMembers: [],
  chores: [],
  reviews: [],
  inventory: {
    treats: 100,
    maxTreats: 100,
    lastUpdated: new Date().toISOString()
  }
};

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return defaultData;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Team Members API
app.get('/api/team-members', (req, res) => {
  const data = readData();
  res.json(data.teamMembers);
});

app.post('/api/team-members', (req, res) => {
  const data = readData();
  const newMember = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email || '',
    avatar: req.body.avatar || null,
    photo: req.body.photo || null,
    species: req.body.species || 'dog',
    createdAt: new Date().toISOString()
  };
  data.teamMembers.push(newMember);
  writeData(data);
  res.status(201).json(newMember);
});

app.put('/api/team-members/:id', (req, res) => {
  const data = readData();
  const index = data.teamMembers.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  data.teamMembers[index] = { ...data.teamMembers[index], ...req.body };
  writeData(data);
  res.json(data.teamMembers[index]);
});

app.delete('/api/team-members/:id', (req, res) => {
  const data = readData();
  const index = data.teamMembers.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  data.teamMembers.splice(index, 1);
  // Also unassign from any chores
  data.chores.forEach(chore => {
    if (chore.assignedTo === req.params.id) {
      chore.assignedTo = null;
    }
  });
  writeData(data);
  res.status(204).send();
});

// Settings API
app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json(data.settings || { calendarName: 'Office Chores Manager' });
});

app.put('/api/settings', (req, res) => {
  const data = readData();
  data.settings = { ...data.settings, ...req.body };
  writeData(data);
  res.json(data.settings);
});

// Chores API
app.get('/api/chores', (req, res) => {
  const data = readData();
  res.json(data.chores);
});

app.post('/api/chores', (req, res) => {
  const data = readData();
  const newChore = {
    id: Date.now().toString(),
    title: req.body.title,
    description: req.body.description || '',
    assignedTo: req.body.assignedTo || null,
    coAssignee: req.body.coAssignee || null,
    isGuild: req.body.isGuild || false,
    isHeist: req.body.isHeist || false, // HEIST MODE: Meta-tag for treat thefts
    recurrence: req.body.recurrence || 'none', // none, daily, weekly, monthly
    startDate: req.body.startDate,
    dueDate: req.body.dueDate || null,
    completedDates: req.body.completedDates || [],
    completed: req.body.completed || false, // Completion lag flag
    createdAt: new Date().toISOString()
  };
  data.chores.push(newChore);
  writeData(data);
  res.status(201).json(newChore);
});

app.put('/api/chores/:id', (req, res) => {
  const data = readData();
  const index = data.chores.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }
  data.chores[index] = { ...data.chores[index], ...req.body };
  writeData(data);
  res.json(data.chores[index]);
});

app.delete('/api/chores/:id', (req, res) => {
  const data = readData();
  const index = data.chores.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }
  data.chores.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

// Mark chore as complete for a specific date
app.post('/api/chores/:id/complete', (req, res) => {
  const data = readData();
  const index = data.chores.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }
  const dateToComplete = req.body.date || new Date().toISOString().split('T')[0];
  const isNewCompletion = !data.chores[index].completedDates.includes(dateToComplete);
  
  console.log(`Marking chore complete: ${data.chores[index].title}, isNewCompletion: ${isNewCompletion}`);
  
  if (isNewCompletion) {
    data.chores[index].completedDates.push(dateToComplete);
    
    // Deduct treats if this is a "Steal treats" type chore
    const choreTitle = data.chores[index].title;
    const isStealsChore = choreTitle && choreTitle.toLowerCase().includes('steal treat');
    console.log(`Chore title: "${choreTitle}", isStealsChore: ${isStealsChore}`);
    
    if (isStealsChore) {
      if (!data.inventory) data.inventory = { treats: 0, maxTreats: 100, lastUpdated: new Date().toISOString() };
      const treatsBefore = data.inventory.treats;
      data.inventory.treats = Math.max(0, data.inventory.treats - 1);
      data.inventory.lastUpdated = new Date().toISOString();
      console.log(`Treats deducted: ${treatsBefore} -> ${data.inventory.treats}`);
    }
  }
  writeData(data);
  console.log('Response inventory:', data.inventory);
  res.json({ chore: data.chores[index], inventory: data.inventory });
});

// Unmark chore completion for a specific date
app.post('/api/chores/:id/uncomplete', (req, res) => {
  const data = readData();
  const index = data.chores.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }
  const dateToUncomplete = req.body.date || new Date().toISOString().split('T')[0];
  const wasCompleted = data.chores[index].completedDates.includes(dateToUncomplete);
  
  console.log(`Unmarking chore complete: ${data.chores[index].title}, wasCompleted: ${wasCompleted}`);
  
  data.chores[index].completedDates = data.chores[index].completedDates.filter(d => d !== dateToUncomplete);
  
  // Restore treats if this is a "Steal treats" type chore
  const choreTitle = data.chores[index].title;
  if (wasCompleted && choreTitle && choreTitle.toLowerCase().includes('steal treat')) {
    if (!data.inventory) data.inventory = { treats: 0, maxTreats: 100, lastUpdated: new Date().toISOString() };
    const treatsBefore = data.inventory.treats;
    data.inventory.treats = Math.min(data.inventory.maxTreats, data.inventory.treats + 1);
    data.inventory.lastUpdated = new Date().toISOString();
    console.log(`Treats restored: ${treatsBefore} -> ${data.inventory.treats}`);
  }
  writeData(data);
  console.log('Response inventory:', data.inventory);
  res.json({ chore: data.chores[index], inventory: data.inventory });
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  const data = readData();
  res.json(data.reviews || []);
});

app.post('/api/reviews', (req, res) => {
  const data = readData();
  if (!data.reviews) data.reviews = [];
  const newReview = {
    id: Date.now().toString(),
    memberId: req.body.memberId,
    rating: req.body.rating || null, // 1-5 stars
    comment: req.body.comment,
    isMonthlyAudit: req.body.isMonthlyAudit || false,
    monthYear: req.body.monthYear || null,
    createdAt: new Date().toISOString()
  };
  data.reviews.push(newReview);
  writeData(data);
  res.status(201).json(newReview);
});

// Delete all reviews (must be defined before the param route)
app.delete('/api/reviews/all', (req, res) => {
  const data = readData();
  const deletedCount = data.reviews ? data.reviews.length : 0;
  data.reviews = [];
  writeData(data);
  res.json({ message: 'All reviews deleted', deletedCount: deletedCount });
});

app.delete('/api/reviews/:id', (req, res) => {
  const data = readData();
  if (!data.reviews) data.reviews = [];
  const index = data.reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  data.reviews.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

app.put('/api/reviews/:id', (req, res) => {
  const data = readData();
  if (!data.reviews) data.reviews = [];
  const index = data.reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  data.reviews[index] = {
    ...data.reviews[index],
    rating: req.body.rating !== undefined ? req.body.rating : data.reviews[index].rating,
    comment: req.body.comment !== undefined ? req.body.comment : data.reviews[index].comment,
    updatedAt: new Date().toISOString()
  };
  writeData(data);
  res.json(data.reviews[index]);
});


// Inventory Management API
app.get('/api/inventory', (req, res) => {
  const data = readData();
  if (!data.inventory) {
    data.inventory = { treats: 100, maxTreats: 100, lastUpdated: new Date().toISOString() };
    writeData(data);
  }
  res.json(data.inventory);
});

// Inventory sync endpoint - recalculates treats based on actual completed "Steal treats" chores
app.post('/api/inventory/sync', (req, res) => {
  const data = readData();
  if (!data.inventory) {
    data.inventory = { treats: 100, maxTreats: 100, lastUpdated: new Date().toISOString() };
  }
  
  // Count total completed "Steal treats" chores across all dates
  let totalStolenTreats = 0;
  if (data.chores) {
    data.chores.forEach(chore => {
      if (chore.title && chore.title.toLowerCase().includes('steal treat')) {
        totalStolenTreats += (chore.completedDates ? chore.completedDates.length : 0);
      }
    });
  }
  
  // Calculate treats remaining (100 minus what was stolen)
  data.inventory.treats = Math.max(0, data.inventory.maxTreats - totalStolenTreats);
  data.inventory.lastUpdated = new Date().toISOString();
  writeData(data);
  
  console.log(`Inventory synced: total treats stolen: ${totalStolenTreats}, treats remaining: ${data.inventory.treats}`);
  res.json(data.inventory);
});

app.put('/api/inventory', (req, res) => {
  const data = readData();
  if (!data.inventory) {
    data.inventory = { treats: 100, maxTreats: 100, lastUpdated: new Date().toISOString() };
  }
  
  if (req.body.treats !== undefined) {
    data.inventory.treats = Math.max(0, Math.min(req.body.treats, data.inventory.maxTreats));
  }
  if (req.body.maxTreats !== undefined) {
    data.inventory.maxTreats = req.body.maxTreats;
  }
  
  data.inventory.lastUpdated = new Date().toISOString();
  writeData(data);
  res.json(data.inventory);
});

app.post('/api/inventory/refill', (req, res) => {
  const data = readData();
  if (!data.inventory) {
    data.inventory = { treats: 100, maxTreats: 100, lastUpdated: new Date().toISOString() };
  }
  
  data.inventory.treats = data.inventory.maxTreats;
  data.inventory.lastUpdated = new Date().toISOString();
  writeData(data);
  res.json({ message: 'Jar refilled!', inventory: data.inventory });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
