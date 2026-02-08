const REVIEW_TEMPLATES = {
  dog: [
    "A standout week for {name}. Their commitment to 'The Good Boy' protocol is unmatched, though the drool-to-task ratio remains high.",
    "{name}'s performance was paws-itive! While they failed to catch the mailman, their floor-vacuuming efficiency is at an all-time high.",
    "Manager Note: {name} is easily motivated by cheese. Successfully defended the sofa from a very aggressive squirrel through the window."
  ],
  cat: [
    "{name} completed tasks with their usual air of profound boredom. Gravity experiments were 100% successful. Human remains judged.",
    "Performance was adequate, though {name} spent 90% of the work week napping in a sunbeam. They have requested a raise in the form of tuna.",
    "Reviewer was hissed at during the appraisal. {name} is clearly overqualified and unimpressed by our management style."
  ],
  goldfish: [
    "An enigmatic week. {name} seems to have forgotten every task they completed, yet they remain remarkably calm under pressure.",
    "High marks for bubble production! {name} spent most of the week investigating the 'Blue Gravel' department with extreme focus.",
    "The employee stared into the void for 40 hours. The void stared back. A promotion to 'Chief Bubble Officer' is recommended."
  ],
  parrot: [
    "The loudest week on record. {name} perfectly reproduced the sound of a fire alarm to get out of cleaning. Brilliant, if annoying.",
    "Excellent communication skills. {name} spent the week lecturing the toaster. Productivity is high, but the sass levels are critical.",
    "Employee of the week? {name} seems to think so, as they have been chanting their own name since Tuesday."
  ],
  lizard: [
    "Incredible stillness. {name} is the most stoic member of the team. Their push-up form during the morning stand-up was impeccable.",
    "Manager was unsure if {name} was working or was a very convincing statue. Either way, the crickets have been successfully managed.",
    "Steady performance. {name} successfully shed their old KPIs (and their skin) this week. A fresh start for a scaly professional."
  ],
  hamster: [
    "{name} ran the wheel of achievement this week. Distance traveled: 47 miles. Productivity: immeasurable. Wheel noise: DEAFENING.",
    "Working smarter, not harder. {name} discovered that completing tasks while running at full speed becomes an Olympic event.",
    "Observed {name} sleeping 23 hours and completing tasks in 1-hour bursts. Still somehow outperformed the entire team."
  ],
  rabbit: [
    "Exceptional reflexes. {name} binky-hopped through every assignment this week with remarkable agility. Perhaps too much lettuce before meetings.",
    "{name} has filed a 15-page complaint report about unacceptable snack variety. Work performance: solid. Morale advocacy: professional.",
    "Word of caution: {name} may have escaped twice to the back garden. Chore completion rate remains mysteriously high regardless."
  ],
  snake: [
    "Intimidatingly efficient. {name} consumed their entire workload in one gulp and is now coiled up for three weeks of digestion.",
    "{name} completed tasks with the precision of a predator. Colleagues report feeling watched. Unfair advantage: no limbs to get distracted.",
    "Shedding old processes and growing into new ones. {name} is literally leaving the past behind. Season: transformation complete."
  ]
};

const ZERO_TASK_TEMPLATES = {
  dog: [
    "{name} has gone rogue. All tasks mysteriously incomplete. Last seen chasing something invisible through the office.",
    "Investigation pending: {name} claims they were 'too busy being a good boy' to complete any tasks.",
    "{name} submitted a written excuse in paw prints. Indecipherable, but filled with enthusiasm."
  ],
  cat: [
    "{name} has filed a formal complaint requesting immediate relocation to a sunbeam. Tasks remain untouched.",
    "Zero tasks for {name} this week. They are not apologetic, and frankly, disappointed in all of us.",
    "{name} knocked all tasks off the desk. Literally. They're on the floor now."
  ],
  goldfish: [
    "{name} appears to have completed zero tasks. Or possibly completed them all thrice. Memory: inconclusive.",
    "Did {name} do anything this week? The question remains a profound mystery in the void.",
    "{name} spent the week in a state of existential contemplation. Productivity: abstract."
  ],
  parrot: [
    "{name} has been very vocal about why tasks are 'beyond their skill set.' Repeatedly. Very loudly.",
    "Zero accomplishments for {name}, but they have learned the phrase 'Not It' and apply it liberally.",
    "{name} demands we reassess the entire performance system. Preferably through song."
  ],
  lizard: [
    "{name} maintained perfect stillness all week. Zero tasks completed. Zero effort expended. Respect the zen.",
    "Rock report: {name} has become indistinguishable from office landscaping. Zero tasks, infinite peace.",
    "{name}'s stillness is so profound that we've begun to question whether they're still here."
  ],
  hamster: [
    "{name} ran in circles all week. Zero tasks completed. All energy directed toward wheel optimization.",
    "Update: {name}'s wheel addiction has reached critical levels. Tasks: forgotten. Velocity: unstoppable.",
    "{name} has achieved perfect work-life balance by ignoring all work and maximizing wheel time."
  ],
  rabbit: [
    "{name} has escaped the premises seventeen times this week. Tasks: ignored. Lettuce: located.",
    "{name}'s HR complaint about task assignments has been filed in triplicate. They're very efficient at complaining.",
    "Zero productivity from {name}. All focus directed toward hopping-related pursuits."
  ],
  snake: [
    "{name} has constructed a comfortable coil and appears to be in a productivity hibernation state. ETA for tasks: unknown.",
    "Zero tasks from {name} this week. They're digesting their feelings about the current workload.",
    "{name} has positioned themselves as the office sentinel. Tasks: secondary to observation duty."
  ]
};

/**
 * Generates a witty, species-specific performance review
 * @param {string} petName - The pet's name
 * @param {string} species - The species (dog, cat, goldfish, parrot, lizard, hamster, rabbit, snake)
 * @param {number} taskCount - Number of tasks completed
 * @returns {string} The generated review
 */
export const generateWeeklyReview = (petName, species, taskCount) => {
  const speciesKey = species?.toLowerCase() || 'dog';
  
  if (taskCount === 0) {
    const zeroTemplates = ZERO_TASK_TEMPLATES[speciesKey] || ZERO_TASK_TEMPLATES.dog;
    const randomReview = zeroTemplates[Math.floor(Math.random() * zeroTemplates.length)];
    return randomReview.replace("{name}", petName) + ` (${taskCount} tasks verified).`;
  }

  const templates = REVIEW_TEMPLATES[speciesKey] || REVIEW_TEMPLATES.dog;
  const randomReview = templates[Math.floor(Math.random() * templates.length)];

  return randomReview.replace("{name}", petName) + ` (${taskCount} tasks verified).`;
};

/**
 * Calculates a manager grade (A+ through F) based on task completion
 * @param {number} completedTasks - Number of completed tasks
 * @param {number} totalTasks - Total number of assigned tasks
 * @returns {object} { grade, percentage, color, description }
 */
export const calculateManagerGrade = (completedTasks, totalTasks) => {
  if (totalTasks === 0) {
    return {
      grade: 'N/A',
      percentage: 0,
      color: '#999',
      description: 'No tasks assigned'
    };
  }

  const percentage = (completedTasks / totalTasks) * 100;

  let grade, color, description;

  if (percentage >= 95) {
    grade = 'A+';
    color = '#2ecc71';
    description = 'Outstanding performance';
  } else if (percentage >= 90) {
    grade = 'A';
    color = '#27ae60';
    description = 'Excellent work';
  } else if (percentage >= 85) {
    grade = 'B+';
    color = '#3498db';
    description = 'Very good';
  } else if (percentage >= 80) {
    grade = 'B';
    color = '#2980b9';
    description = 'Good performance';
  } else if (percentage >= 75) {
    grade = 'C+';
    color = '#f39c12';
    description = 'Satisfactory';
  } else if (percentage >= 70) {
    grade = 'C';
    color = '#e67e22';
    description = 'Average';
  } else if (percentage >= 60) {
    grade = 'D';
    color = '#e74c3c';
    description = 'Below average';
  } else {
    grade = 'F';
    color = '#c0392b';
    description = 'Needs improvement';
  }

  return {
    grade,
    percentage: Math.round(percentage),
    color,
    description
  };
};

/**
 * Generates a personalized monthly review based on actual completed tasks
 * @param {string} petName - The pet's name
 * @param {string} species - The species
 * @param {array} completedTasks - Array of task names completed this month
 * @returns {string} The personalized monthly review
 */
export const generateMonthlyReview = (petName, species, completedTasks) => {
  const speciesKey = species?.toLowerCase() || 'dog';
  
  // Filter out undefined or empty tasks
  const validTasks = completedTasks?.filter(t => t && t !== 'undefined') || [];
  
  if (!validTasks || validTasks.length === 0) {
    const noTaskMessages = {
      dog: [
        `${petName} submitted a blank report. Upon investigation, they were napping.`,
        `${petName}'s monthly summary: "Rested." Quality over quantity, we suppose.`,
        `No documented tasks from ${petName} this month. They're perfecting their loaf position.`
      ],
      cat: [
        `${petName}'s report arrived empty. A silent protest against our management style.`,
        `${petName} refuses to acknowledge this month ever happened. Motion denied.`,
        `Zero tasks recorded for ${petName}. They're too busy judging us from the shelf.`
      ],
      goldfish: [
        `${petName} cannot recall completing any tasks. Or perhaps they forgot already.`,
        `Monthly review: ${petName} stared into the void. Still staring. No tasks completed.`,
        `No tasks for ${petName} this month—but they perfected their bubble repertoire.`
      ],
      parrot: [
        `${petName} screamed their entire monthly report. Content was unintelligible.`,
        `This month, ${petName} focused on vocal performance rather than productivity.`,
        `${petName} claims they didn't do anything because it's "beneath them."`,
      ],
      lizard: [
        `${petName} remained perfectly still the entire month. Tasks were not part of this meditation.`,
        `Observation: ${petName} has achieved ultimate zen by completing zero tasks.`,
        `${petName} was indistinguishable from the office decor. No tasks accomplished.`
      ],
      hamster: [
        `${petName} ran 1,200 miles on the wheel but documented zero official tasks.`,
        `${petName} was too busy organizing their hoarding strategy to do actual work.`,
        `The wheel never stopped spinning all month. Tasks: somehow still zero.`
      ],
      rabbit: [
        `${petName} escaped the premises twice this month. Tasks were the least of our concerns.`,
        `Monthly report: ${petName} was preoccupied with lettuce acquisition.`,
        `No tasks completed by ${petName}—they were too busy thumping disapprovingly.`
      ],
      snake: [
        `${petName} entered a three-week digestive state. Tasks are currently on pause.`,
        `This month, ${petName} focused on coiling comfort rather than productivity.`,
        `${petName} had eyes for nothing but their next meal. Zero tasks completed.`
      ]
    };

    const messages = noTaskMessages[speciesKey] || noTaskMessages.dog;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Task-specific reviews - each species has unique ways of describing what was done
  // More diverse, personality-driven templates for truly unique monthly reviews
  const taskReviews = {
    dog: [
      `${petName} tackled ${validTasks.slice(0, 2).map(t => `"${t}"`).join(' and ')} with characteristic enthusiasm. The drool budget exceeded projections.`,
      `This month's achievements: ${validTasks.map(t => `"${t}"`).join(', ')}. All pursued as diligently as a squirrel.`,
      `${petName} proved their worth by completing: ${validTasks.map(t => `"${t}"`).join(', ')}. Good boy status: unrevoked.`,
      `Hard work documented: ${petName} successfully managed ${validTasks.map(t => `"${t}"`).join(', ')}. Tail wagging verified.`,
      `${petName}'s performance: flawless execution with ${validTasks.slice(0, 1).map(t => `"${t}"`).join()} among other duties. Zoomies optional.`,
      `Loyalty in action: ${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')}. Requests head pats as compensation.`,
      `Remarkable focus from ${petName} managing ${validTasks.map(t => `"${t}"`).join(', ')} while remaining 87% adorable.`,
      `${petName}'s work ethic this month: ${validTasks.map(t => `"${t}"`).join(', ')}. Panting intensifies with pride.`
    ],
    cat: [
      `${petName} deigned to complete: ${validTasks.map(t => `"${t}"`).join(', ')}. Did they try? Debatable. Results: undeniable.`,
      `This month's accomplishments by ${petName}: ${validTasks.map(t => `"${t}"`).join(', ')}. Their indifference remains legendary.`,
      `${petName} finished ${validTasks.map(t => `"${t}"`).join(', ')} only because THEY decided it was worthy of their time.`,
      `Submitted by ${petName}: completion of ${validTasks.map(t => `"${t}"`).join(', ')}. Attitude: insufferable yet effective.`,
      `${petName}'s work this month: ${validTasks.map(t => `"${t}"`).join(', ')}. They remain unimpressed by our gratitude.`,
      `Against all odds, ${petName} bothered with ${validTasks.map(t => `"${t}"`).join(', ')}. They demand premium treats for this offense.`,
      `${petName} glared at us while completing ${validTasks.map(t => `"${t}"`).join(', ')}. Assassination plots suspected.`,
      `Somehow ${petName} managed ${validTasks.map(t => `"${t}"`).join(', ')} between judging our life choices. Impressive timing.`
    ],
    goldfish: [
      `${petName} may have completed ${validTasks.map(t => `"${t}"`).join(', ')}. The timeline is mysterious and profound.`,
      `Mysterious accomplishments by ${petName}: ${validTasks.map(t => `"${t}"`).join(', ')}. They forget in real time.`,
      `Did ${petName} do ${validTasks.map(t => `"${t}"`).join(', ')}? Yes. Will they remember? Unlikely.`,
      `${petName} somehow finished: ${validTasks.map(t => `"${t}"`).join(', ')}. Bubble-related productivity remains unconfirmed.`,
      `${petName}'s work portfolio includes: ${validTasks.map(t => `"${t}"`).join(', ')}. Clarity on HOW: nonexistent.`,
      `Observations confirm ${petName} engaged in ${validTasks.map(t => `"${t}"`).join(', ')}. Proof: only visible in the void.`,
      `This month ${petName} pondered: ${validTasks.map(t => `"${t}"`).join(', ')}. Then forgot they did it. Twice.`,
      `${petName}'s three-day memory was challenged successfully with ${validTasks.map(t => `"${t}"`).join(', ')}. Evidence: circular.`
    ],
    parrot: [
      `${petName} LOUDLY announced completion of: ${validTasks.map(t => `"${t}"`).join(', ')}. Thrice. At maximum volume.`,
      `${petName} shrieked about finishing: ${validTasks.map(t => `"${t}"`).join(', ')}. Ear damage: cosmetic.`,
      `This month's performance by ${petName}: ${validTasks.map(t => `"${t}"`).join(', ')}. The screeching was excessive but genuine.`,
      `${petName} boasted quite literally all month about: ${validTasks.map(t => `"${t}"`).join(', ')}. Sass level: critical.`,
      `${petName} performed ${validTasks.map(t => `"${t}"`).join(', ')} between unsolicited commentary sessions.`,
      `Impressive volume control: ${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')}. The squawking never stopped though.`,
      `${petName}'s mouth never closed while handling ${validTasks.map(t => `"${t}"`).join(', ')}. Productivity: high. Peace: minimal.`,
      `Warning: ${petName} has already memorized and will repeat their own achievement of ${validTasks.map(t => `"${t}"`).join(', ')} forever.`
    ],
    lizard: [
      `${petName} statuesquely achieved: ${validTasks.map(t => `"${t}"`).join(', ')}. Zen efficiency: unmatched.`,
      `While barely moving, ${petName} completed: ${validTasks.map(t => `"${t}"`).join(', ')}. Their method defies logic.`,
      `${petName} maintained perfect stillness while finishing: ${validTasks.map(t => `"${t}"`).join(', ')}. Mysterious and effective.`,
      `Zero visible effort. Maximum results. ${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')}. Teach us.`,
      `${petName} achieved ${validTasks.map(t => `"${t}"`).join(', ')} through pure existential power.`,
      `${petName}'s pushups between tasks were perfect form. Tasks completed: ${validTasks.map(t => `"${t}"`).join(', ')}. Respect: earned.`,
      `Immobility is a superpower. ${petName} proved this with ${validTasks.map(t => `"${t}"`).join(', ')}. We don't understand their methods.`,
      `${petName} out-performed everyone while remaining 99% rock-like throughout: ${validTasks.map(t => `"${t}"`).join(', ')}.`
    ],
    hamster: [
      `${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')} while running 847 miles on the wheel. Simultaneously.`,
      `Hyperactivity resulted in: ${validTasks.map(t => `"${t}"`).join(', ')}. Wheel noise: apocalyptic. Achievement: real.`,
      `${petName}'s cheek pouches may have absorbed the credit for: ${validTasks.map(t => `"${t}"`).join(', ')}. Still counts.`,
      `During their nocturnal marathons, ${petName} managed: ${validTasks.map(t => `"${t}"`).join(', ')}. Sleep: never.`,
      `${petName} somehow finished ${validTasks.map(t => `"${t}"`).join(', ')} while never stopping moving. Ever.`,
      `Perpetual motion machine energy powered ${petName} through ${validTasks.map(t => `"${t}"`).join(', ')}. Battery: inexhaustible.`,
      `${petName} blurred through ${validTasks.map(t => `"${t}"`).join(', ')}. The wheel kept spinning. Still spinning. Always spinning.`,
      `At full velocity, ${petName} tackled ${validTasks.map(t => `"${t}"`).join(', ')}. We watched from a safe distance with earplugs.`
    ],
    rabbit: [
      `${petName} binky-hopped through: ${validTasks.map(t => `"${t}"`).join(', ')}. Escape attempts: three. Success: mixed.`,
      `${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')} between filing complaints about food quality.`,
      `${petName}'s summary: ${validTasks.map(t => `"${t}"`).join(', ')} accomplished, one garden vandalization achieved.`,
      `This month, ${petName} managed: ${validTasks.map(t => `"${t}"`).join(', ')}. Lettuce intake: excessive as always.`,
      `${petName} hopped through ${validTasks.map(t => `"${t}"`).join(', ')}. Thumps of disapproval: numerous.`,
      `Impressive agility displayed while handling ${validTasks.map(t => `"${t}"`).join(', ')}. Escape velocity maintained throughout.`,
      `${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')} while loudly demanding better working conditions (more vegetables).`,
      `Binky-powered excellence: ${petName} tackled ${validTasks.map(t => `"${t}"`).join(', ')}. Flopped in satisfaction afterwards.`
    ],
    snake: [
      `${petName} consumed their workload of ${validTasks.map(t => `"${t}"`).join(', ')}. Now digesting for three weeks.`,
      `${petName} completed ${validTasks.map(t => `"${t}"`).join(', ')} with predatory precision. Colleagues remain unnerved.`,
      `${petName}'s accomplishments: ${validTasks.map(t => `"${t}"`).join(', ')}. They've shed their old limitations.`,
      `This month, ${petName} proved that ${validTasks.map(t => `"${t}"`).join(', ')} are no match for predatory efficiency.`,
      `${petName} has metaphorically consumed: ${validTasks.map(t => `"${t}"`).join(', ')}. Check back in three weeks.`,
      `Coiled and efficient, ${petName} handled ${validTasks.map(t => `"${t}"`).join(', ')}. Still predatory. Still watching everyone.`,
      `${petName} strikes without warning and conquered ${validTasks.map(t => `"${t}"`).join(', ')}. Danger: persistent as always.`,
      `Cold-blooded execution of ${validTasks.map(t => `"${t}"`).join(', ')} achieved by ${petName}. They're now resting with satisfaction.`
    ]
  };

  const reviews = taskReviews[speciesKey] || taskReviews.dog;
  // Use a seeded random based on petName + species to ensure consistency but variety
  const seed = (petName + speciesKey).charCodeAt(0) + Math.floor(Math.random() * reviews.length);
  return reviews[seed % reviews.length];
};

/**
 * Gets tasks completed by a member in a specific month
 * @param {array} chores - All chores
 * @param {string} memberId - The member's ID
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {array} Array of task names completed
 */
export const getCompletedTasksForMonth = (chores, memberId, year, month) => {
  const monthStart = new Date(year, month, 1);
  monthStart.setHours(0, 0, 0, 0);
  
  const monthEnd = new Date(year, month + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const completedTaskNames = [];
  const seenTasks = new Set();

  if (!chores || !Array.isArray(chores)) return completedTaskNames;

  chores.forEach(chore => {
    // Use either title or name for chores (data may use either field)
    const choreName = (chore.title || chore.name || '').toString().trim();
    if (!choreName || choreName.toLowerCase() === 'undefined') return; // Skip invalid names

    if ((chore.assignedTo === memberId || chore.coAssignee === memberId) &&
        chore.completedDates && Array.isArray(chore.completedDates)) {
      const hasCompletionInMonth = chore.completedDates.some(dateStr => {
        const completedDate = new Date(dateStr + 'T00:00:00');
        return completedDate >= monthStart && completedDate <= monthEnd;
      });

      if (hasCompletionInMonth && !seenTasks.has(choreName)) {
        completedTaskNames.push(choreName);
        seenTasks.add(choreName);
      }
    }
  });

  return completedTaskNames;
};
