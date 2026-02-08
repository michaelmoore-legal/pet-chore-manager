/**
 * PET PERSONALITY SYSTEM
 * Species-specific humorous chore library for contextual chaos
 */

export const PET_CHORES = {
  dog: [
    "Protect house from suspiciously stationary leaf",
    "Professional floor vacuuming (accidental crumbs)",
    "Request belly rub via aggressive sighing",
    "Zoomies at 100mph for no apparent reason",
    "Stare intensely at the last bite of pizza",
    "Bark at the mailman"
  ],
  cat: [
    "Conduct gravity experiment (knock glass off table)",
    "Sit on keyboard during important meeting",
    "Judge human's life choices from a high shelf",
    "Scream at the bottom of a half-full food bowl",
    "Sprint through the house at 3 AM",
    "Knock a pen off the desk for mysterious reasons"
  ],
  parrot: [
    "Perfectly mimic the microwave beep to confuse humans",
    "Attempt to unscrew the remote control buttons",
    "Lecture the wall for 20 minutes",
    "Perform a stadium-level screech for a single grape",
    "Argue with the reflection in the toaster",
    "Repeat embarrassing words at full volume"
  ],
  rabbit: [
    "Reorganize the 'spicy hay' (electrical cords)",
    "Thump loudly to show mild inconvenience",
    "Perform a 'binky' mid-air twist",
    "Munch greens with extreme judgment",
    "Dig a tunnel into the sofa cushions",
    "Bunny flop directly on a clean blanket"
  ],
  hamster: [
    "Run a midnight marathon on the squeaky wheel",
    "Stuff 400% of body weight into cheek pouches",
    "Rearrange sawdust into a structural masterpiece",
    "Attempt a daring escape through a 1cm gap",
    "Sleep in a confusingly flat position",
    "Hoard treats like a furry dragon"
  ],
  parakeet: [
    "Discuss politics with the bell",
    "Fling seeds with artistic precision",
    "Landing practice on a human's head",
    "Singing a 4-hour remix of a single whistle note",
    "Aggressively preen a plastic bird friend",
    "Chew through wooden perches with enthusiasm"
  ],
  lizard: [
    "Intense push-ups to assert dominance over a cricket",
    "Become a literal statue for 6 consecutive hours",
    "Lick own eyeball for hygiene",
    "Judge the heat lamp's performance",
    "Shed skin in one confusingly ghostly piece",
    "Stare at something invisible and very important"
  ],
  goldfish: [
    "Forget what happened 3 seconds ago",
    "Stare into the void (and the void stares back)",
    "Investigate the plastic castle for the 1000th time",
    "Blow a bubble of extreme significance",
    "Swim in a very serious circle",
    "Ignore the human who feeds them"
  ]
};

/**
 * Guild Tasks: Humorous combinations of two pet species working together
 * Format: "species1-species2" -> array of guild task titles
 */
export const GUILD_TASKS = {
  "dog-cat": [
    "Collaborative kitchen floor inspection",
    "Joint defense against the mysterious red dot",
    "Synchronized napping with strategic seating",
    "Unified ignoring of human dinner time",
    "Team negotiations over a single toy"
  ],
  "dog-parrot": [
    "Bark-and-screech duet concert",
    "Synchronized begging at dinner table",
    "Joint investigation of every unexpected sound",
    "Competitive attention-seeking performance",
    "Loud commentary on the neighbor's dog"
  ],
  "cat-rabbit": [
    "Tense standoff over shared territory",
    "Simultaneous zoomies through the hallway",
    "Strategic napping near each other (not together)",
    "Joint destruction of cardboard boxes",
    "Competitive grooming salon activities"
  ],
  "hamster-goldfish": [
    "Staring contest (one is unaware)",
    "Separate but equally cute wheel racing",
    "Extreme zoning out: a comparison",
    "Professional procrastination demonstration",
    "Simultaneous forgetting what they were doing"
  ],
  "parrot-parakeet": [
    "Screaming contest to establish dominance",
    "Coordinated seed-flinging operation",
    "Synchronized bell-ringing chaos",
    "Dueling squawks of disapproval",
    "Tag-team mirror conversation"
  ],
  "dog-rabbit": [
    "Chase protocol: one running, one hopping",
    "Coordinated destruction of the garden",
    "Fellowship of the burrowers (dog tried once)",
    "Mutual zoomies enthusiasts",
    "Team sport: thumping and skidding"
  ],
  "lizard-goldfish": [
    "Extreme staring championship",
    "Perfectly motionless meditation session",
    "Judging everyone from their respective tanks",
    "Synchronized contemplation of their existence",
    "World's most boring team meeting"
  ]
};

/**
 * Generate a humorous task based on pet species
 * @param {string} species - Pet species (e.g., 'dog', 'cat')
 * @returns {string} - Random chore title for that species
 */
export function generateFunnyTask(species) {
  const speciesList = Object.keys(PET_CHORES);
  const validSpecies = speciesList.includes(species) ? species : 'dog';
  const tasks = PET_CHORES[validSpecies];
  return tasks[Math.floor(Math.random() * tasks.length)];
}

/**
 * Generate a guild task based on two pet species
 * @param {string} species1 - First pet species
 * @param {string} species2 - Second pet species
 * @returns {string} - Guild task title
 */
export function generateFunnyGuildTask(species1, species2) {
  // Sort species alphabetically to create consistent key lookup
  const key1 = `${species1}-${species2}`;
  const key2 = `${species2}-${species1}`;
  
  let tasks = GUILD_TASKS[key1];
  if (!tasks) {
    tasks = GUILD_TASKS[key2];
  }
  
  // Fallback to generic guild task if species combo not found
  if (!tasks) {
    const genericGuildTasks = [
      "Team effort: mild chaos",
      "Coordinated pet synergy moment",
      "Unexpected partnership achievement",
      "Temporary truce for mutual mischief",
      "Amazing petsami (pet teamwork)"
    ];
    tasks = genericGuildTasks;
  }
  
  return tasks[Math.floor(Math.random() * tasks.length)];
}

/**
 * Get all valid species
 */
export function getAllSpecies() {
  return Object.keys(PET_CHORES);
}
