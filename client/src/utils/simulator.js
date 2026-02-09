/**
 * CHAOS MODE: Asynchronous Task Generator with Pet Personalities
 * Generates 1-4 random tasks MAX PER DAY across all team members
 * Uses species-specific humorous tasks and guild combinations
 */

import { generateFunnyTask, generateFunnyGuildTask } from './petChores';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function runChaosSimulation(
  teamMembers,
  choreLibrary,
  currentMonth,
  currentYear,
  onTaskCreated,
  onSimulationComplete
) {
  if (!teamMembers.length) {
    console.warn('Chaos Mode: Missing team members');
    return;
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let tasksCreated = 0;

  console.log(`🎮 CHAOS MODE ACTIVATED: ${daysInMonth} days, ${teamMembers.length} pets, MAX 4 tasks/day`);

  // 1. Iterate through every day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 2. Decide how many tasks happen TODAY (1-4 max across ALL pets)
    const dailyTaskCount = Math.floor(Math.random() * 4) + 1; // 1 to 4

    // 3. Create that many tasks for this day
    for (let i = 0; i < dailyTaskCount; i++) {
      // Pick a random team member for this task
      const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const memberSpecies = randomMember.species || 'dog';

      // 4. HEIST MODE: 30% chance of "Steal treats" task regardless of species
      const isHeist = Math.random() < 0.30;
      let taskTitle = isHeist ? '🍖 Steal treats' : generateFunnyTask(memberSpecies);

      // 5. Guild Task Logic (20% chance for species combo, skip if heist)
      let isGuild = false;
      let coAssigneeId = null;

      if (!isHeist && Math.random() > 0.8) {
        const partners = teamMembers.filter(p => p.id !== randomMember.id);
        if (partners.length > 0) {
          const partner = partners[Math.floor(Math.random() * partners.length)];
          const partnerSpecies = partner.species || 'dog';
          isGuild = true;
          coAssigneeId = partner.id;
          // Generate a guild task based on both species
          taskTitle = generateFunnyGuildTask(memberSpecies, partnerSpecies);
        }
      }

      // 6. Create the simulated chore with species-funny tasks or heist
      const newChore = {
        title: taskTitle,
        description: `Generated in Chaos Mode 🎮${isHeist ? ' 💰 HEIST!' : ''}`,
        assignedTo: randomMember.id,
        coAssignee: coAssigneeId,
        isGuild: isGuild,
        isHeist: isHeist, // Meta-tag for heist tasks
        recurrence: 'none',
        startDate: dateString,
        dueDate: null,
        completedDates: [], // Start empty - completion will be handled by 3-second lag
        createdAt: new Date().toISOString(),
        completed: false // Flag tracking actual completion (separate from scheduledDate)
      };

      // 6. Call the callback to update state
      await onTaskCreated(newChore);
      tasksCreated++;

      // 7. Wait 1 second before next task to let UI breathe
      await sleep(500);
    }
  }

  console.log(`✅ Chaos Mode Complete: ${tasksCreated} species-funny tasks generated over ${daysInMonth} days`);
  onSimulationComplete();
}

/**
 * Helper: Extract unique chore titles for the library
 * (filters out any with no assignedTo to get viable template chores)
 */
export function buildChoreLibrary(allChores) {
  return allChores
    .filter(c => c.assignedTo) // Only use assigned chores as templates
    .reduce((unique, chore) => {
      if (!unique.find(c => c.title === chore.title)) {
        unique.push({
          title: chore.title,
          description: chore.description || '',
          isGuild: chore.isGuild || false
        });
      }
      return unique;
    }, [])
    .slice(0, 10); // Return top 10 unique chores as library
}
