export const initialClasses = [
  {
    id: 'class-1',
    subject: 'Advanced Algorithms',
    lecturer: 'Dr. Arthur Pendragon',
    timeStart: '09:00',
    timeEnd: '10:30',
    day: 'Mon',
    room: 'Auditorium IV',
    type: 'Lecture',
    color: '#6366f1' // Indigo
  },
  {
    id: 'class-2',
    subject: 'Human-Computer Interaction',
    lecturer: 'Dr. Sarah Connor',
    timeStart: '11:00',
    timeEnd: '12:30',
    day: 'Mon',
    room: 'Design Lab 3B',
    type: 'Seminar',
    color: '#ec4899' // Pink
  },
  {
    id: 'class-3',
    subject: 'Database Systems',
    lecturer: 'Prof. Linus Torvalds',
    timeStart: '14:00',
    timeEnd: '15:30',
    day: 'Tue',
    room: 'Server Room A',
    type: 'Lab',
    color: '#06b6d4' // Cyan
  },
  {
    id: 'class-4',
    subject: 'Machine Learning',
    lecturer: 'Dr. Alan Turing',
    timeStart: '09:30',
    timeEnd: '11:00',
    day: 'Wed',
    room: 'Computing Suite 2',
    type: 'Lecture',
    color: '#10b981' // Emerald
  },
  {
    id: 'class-5',
    subject: 'Software Engineering Project',
    lecturer: 'Grace Hopper',
    timeStart: '13:00',
    timeEnd: '15:00',
    day: 'Wed',
    room: 'Collab Zone 1',
    type: 'Seminar',
    color: '#f59e0b' // Amber
  },
  {
    id: 'class-6',
    subject: 'Cryptography',
    lecturer: 'Prof. Adi Shamir',
    timeStart: '10:00',
    timeEnd: '11:30',
    day: 'Thu',
    room: 'Room 501',
    type: 'Lecture',
    color: '#6366f1' // Indigo
  },
  {
    id: 'class-7',
    subject: 'Distributed Systems',
    lecturer: 'Dr. Leslie Lamport',
    timeStart: '14:00',
    timeEnd: '15:30',
    day: 'Fri',
    room: 'Online - Zoom',
    type: 'Lecture',
    color: '#06b6d4' // Cyan
  }
];

export const initialTasks = [
  {
    id: 'task-1',
    title: 'Implement Red-Black Trees homework',
    dueDate: '2026-07-20',
    priority: 'High',
    status: 'Todo',
    subject: 'Advanced Algorithms'
  },
  {
    id: 'task-2',
    title: 'Conduct user research interviews (3 peers)',
    dueDate: '2026-07-18',
    priority: 'High',
    status: 'In Progress',
    subject: 'Human-Computer Interaction'
  },
  {
    id: 'task-3',
    title: 'Write SQL indexing optimization script',
    dueDate: '2026-07-24',
    priority: 'Mid',
    status: 'Todo',
    subject: 'Database Systems'
  },
  {
    id: 'task-4',
    title: 'Read chapter 3: Neural Network Architectures',
    dueDate: '2026-07-16',
    priority: 'Low',
    status: 'Completed',
    subject: 'Machine Learning'
  },
  {
    id: 'task-5',
    title: 'Submit software architecture diagram draft',
    dueDate: '2026-07-22',
    priority: 'Mid',
    status: 'Todo',
    subject: 'Software Engineering Project'
  }
];

export const initialFocusStats = [
  { day: 'Mon', minutes: 75 },
  { day: 'Tue', minutes: 45 },
  { day: 'Wed', minutes: 120 },
  { day: 'Thu', minutes: 60 },
  { day: 'Fri', minutes: 90 },
  { day: 'Sat', minutes: 30 },
  { day: 'Sun', minutes: 0 }
];

export const initialGPACourses = [
  { id: 'gpa-1', name: 'Advanced Algorithms', credits: 4, grade: 'A', status: 'Completed' },
  { id: 'gpa-2', name: 'Human-Computer Interaction', credits: 3, grade: 'A-', status: 'Completed' },
  { id: 'gpa-3', name: 'Database Systems', credits: 4, grade: 'B+', status: 'Completed' },
  { id: 'gpa-4', name: 'Machine Learning', credits: 4, grade: 'A', status: 'Completed' },
  { id: 'gpa-5', name: 'Distributed Systems', credits: 3, grade: '', status: 'In Progress' }
];

export const ambientSounds = [
  { id: 'sound-lofi', name: 'Lofi Beats', emoji: '🎧' },
  { id: 'sound-rain', name: 'Soft Rain', emoji: '🌧️' },
  { id: 'sound-forest', name: 'Deep Forest', emoji: '🌲' },
  { id: 'sound-noise', name: 'White Noise', emoji: '💨' }
];
