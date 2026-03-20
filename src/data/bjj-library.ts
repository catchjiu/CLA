export const bjjData = {
  user: {
    name: "Alex Grappler",
    rank: "Purple Belt",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  metrics: {
    matHoursThisMonth: 24.5,
    matHoursTrend: 12, // percentage increase
    topGameEfficiency: 78, // %
    bottomGameEfficiency: 62, // %
  },
  radarData: [
    { subject: 'Week 1', submissionEntry: 40, defensiveRetention: 80 },
    { subject: 'Week 2', submissionEntry: 55, defensiveRetention: 75 },
    { subject: 'Week 3', submissionEntry: 45, defensiveRetention: 85 },
    { subject: 'Week 4', submissionEntry: 65, defensiveRetention: 90 },
  ],
  constraintsProgress: [
    { name: 'Hand Fighting — No Thumbs', proficiency: 85 },
    { name: 'Hip Mobility — Guard Recovery', proficiency: 60 },
    { name: 'Head Positioning — Passing', proficiency: 40 },
    { name: 'Base Framing — Bottom Mount', proficiency: 92 },
  ],
  recentScrimmages: [
    { id: 1, date: 'Today', partner: 'Marcus (Brown)', theme: 'The Back Take Problem', outcome: 'success', insight: 'Maintained rear mount control for 4 mins' },
    { id: 2, date: 'Yesterday', partner: 'Sarah (Purple)', theme: 'Leg Entanglements', outcome: 'danger', insight: 'Caught in inside heel hook, escaping too late' },
    { id: 3, date: '2 days ago', partner: 'John (Blue)', theme: 'Guard Retention', outcome: 'warning', insight: 'Recovered to half guard, needs better framing' },
    { id: 4, date: '3 days ago', partner: 'Coach Dave (Black)', theme: 'Pressure Passing', outcome: 'danger', insight: 'Frame collapsed under heavy crossface' },
  ],
  milestones: [
    { id: 1, name: '200 Successful Tripod Sweeps', current: 145, target: 200, date: 'Mar 30' },
    { id: 2, name: 'Sub Only Tournament Prep', current: 15, target: 30, date: 'Apr 15' },
    { id: 3, name: 'Guillotine Finishes', current: 42, target: 50, date: 'Ongoing' }
  ],
  insights: [
    { id: 1, type: 'warning', text: "Your Guard Retention is high (88%), but your Scramble Recovery has dropped. Focus on 'Seated Guard' constraints this week." },
    { id: 2, type: 'success', text: "Top Game pressure is significantly improved. Top efficiency is up 12%." }
  ]
};
