export const coachData = {
  roster: [
    { id: 1, name: "Marcus", rank: "Brown Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
    { id: 2, name: "Sarah", rank: "Purple Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 3, name: "John", rank: "Blue Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { id: 4, name: "Jessica", rank: "White Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
    { id: 5, name: "David", rank: "Black Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { id: 6, name: "Chris", rank: "White Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris" },
    { id: 7, name: "Amanda", rank: "Blue Belt", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda" },
  ],
  metrics: {
    classesThisWeek: 12,
    totalAttendance: 145,
    avgAttendance: 12.1,
    attendanceTrend: 8, // +8%
  },
  recentClasses: [
    { id: 1, date: "Today, 6:00 PM", type: "Advanced (Gi)", topic: "The Back Take Problem", attendees: 14 },
    { id: 2, date: "Today, 12:00 PM", type: "Fundamentals", topic: "Mount Escapes to Half", attendees: 8 },
    { id: 3, date: "Yesterday, 7:00 PM", type: "No-Gi Comp", topic: "Leg Entanglements", attendees: 18 },
    { id: 4, date: "Yesterday, 6:00 PM", type: "Fundamentals", topic: "Closed Guard Posture", attendees: 12 },
  ],
  curriculumCoverage: [
    { subject: 'Guard Passes', coverage: 40 },
    { subject: 'Leg Locks', coverage: 25 },
    { subject: 'Back Takes', coverage: 55 },
    { subject: 'Wrestling/Takedowns', coverage: 20 },
    { subject: 'Escapes', coverage: 65 },
  ],
};
