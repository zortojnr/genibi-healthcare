// Sample data for demo mode (no authentication required)
export const demoUser = {
  name: "Guest",
  organization: "Genibi",
  role: "Viewer",
};

export const demoAppointments = [
  { id: 1, date: "2025-10-20", time: "10:30", with: "Dr. Avery Thompson", type: "Telehealth" },
  { id: 2, date: "2025-10-22", time: "14:00", with: "Counselor Mia Park", type: "Follow-up" },
];

export const demoMoodEntries = [
  { id: 1, date: "2025-10-15", mood: "Calm", score: 7 },
  { id: 2, date: "2025-10-16", mood: "Stressed", score: 4 },
  { id: 3, date: "2025-10-17", mood: "Optimistic", score: 8 },
  { id: 4, date: "2025-10-18", mood: "Tired", score: 5 },
];

export const demoMedications = [
  { id: 1, name: "Vitamin D", dosage: "1000 IU", schedule: "Daily" },
  { id: 2, name: "Mindfulness Practice", dosage: "10 min", schedule: "Daily" },
];

export const demoLibraryItems = [
  { id: 1, title: "Breathing Techniques for Anxiety", type: "Article" },
  { id: 2, title: "Sleep Hygiene Basics", type: "Guide" },
  { id: 3, title: "Intro to CBT", type: "Video" },
];