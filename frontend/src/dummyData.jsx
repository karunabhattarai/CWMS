export const companies = [
  {
    _id: "ytco1",
    name: "TechVision Studios",
    description:
      "Premier tech review channel with 500K+ subscribers specializing in gadget reviews and tutorials",
    createdBy: "user1",
  },
];

export const users = [
  {
    _id: "user1",
    name: "Alex Johnson",
    email: "alex.johnson@techvision.com",
    password: "hashedPassword1",
    role: "superadmin",
    isVerified: true,
    verificationToken: "token-alex",
  },
  {
    _id: "user2",
    name: "Mira Patel",
    email: "mira.patel@techvision.com",
    password: "hashedPassword2",
    role: "manager",
    company: "ytco1",
    isVerified: true,
    verificationToken: "token-mira",
  },
];

export const roles = [
  {
    _id: "role1",
    name: "Content Strategist",
    description: "Develops video concepts and content calendar",
    company: "ytco1",
  },
  {
    _id: "role2",
    name: "Video Producer/Editor",
    description: "Handles filming and post-production",
    company: "ytco1",
  },
  {
    _id: "role3",
    name: "Graphic Designer",
    description: "Creates thumbnails and channel artwork",
    company: "ytco1",
  },
  {
    _id: "role4",
    name: "Social Media Manager",
    description: "Manages community engagement and promotions",
    company: "ytco1",
  },
];

export const members = [
  {
    _id: "mem1",
    name: "Samuel Carter",
    email: "sam.carter@techvision.com",
    company: "ytco1",
    roles: ["role1"],
  },
  {
    _id: "mem2",
    name: "Jamie Lee",
    email: "jamie.lee@techvision.com",
    company: "ytco1",
    roles: ["role2"],
  },
  {
    _id: "mem3",
    name: "Taylor Kim",
    email: "taylor.kim@techvision.com",
    company: "ytco1",
    roles: ["role3"],
  },
  {
    _id: "mem4",
    name: "Jordan Smith",
    email: "jordan.smith@techvision.com",
    company: "ytco1",
    roles: ["role4"],
  },
];

export const subtaskTemplates = [
  {
    _id: "stt1",
    role: "role1",
    name: "Research & Script Outline",
    description: "Conduct product research and create script structure",
    estimatedDurationDays: 2,
  },
  {
    _id: "stt2",
    role: "role1",
    name: "Final Script Draft",
    description: "Polish script with key talking points",
    estimatedDurationDays: 1,
  },
  {
    _id: "stt3",
    role: "role2",
    name: "B-roll Shooting",
    description: "Film product close-ups and demo shots",
    estimatedDurationDays: 2,
  },
  {
    _id: "stt4",
    role: "role2",
    name: "Main Edit",
    description: "Edit primary footage with transitions",
    estimatedDurationDays: 3,
  },
  {
    _id: "stt5",
    role: "role3",
    name: "Thumbnail Design",
    description: "Create 3 thumbnail options for A/B testing",
    estimatedDurationDays: 1,
  },
  {
    _id: "stt6",
    role: "role4",
    name: "SEO Optimization",
    description: "Optimize title, description, and tags",
    estimatedDurationDays: 1,
  },
  {
    _id: "stt7",
    role: "role4",
    name: "Social Media Snippets",
    description: "Create shorts/reels from main video",
    estimatedDurationDays: 1,
  },
];

export const taskTemplates = [
  {
    _id: "tt1",
    company: "ytco1",
    name: "Standard Video Production",
    description: "End-to-end production for tech review videos",
    subtasks: ["stt1", "stt2", "stt3", "stt4", "stt5", "stt6", "stt7"],
  },
  {
    _id: "tt2",
    company: "ytco1",
    name: "Channel Growth Campaign",
    description: "Monthly strategy for subscriber growth",
    subtasks: ["stt1", "stt6", "stt7"],
  },
];

export const tasks = [
  {
    _id: "task1",
    company: "ytco1",
    taskTemplate: "tt1",
    name: "iPhone 15 Pro Review - Is It Worth Upgrading?",
    deadline: "2023-11-10T00:00:00Z",
    startDate: "2023-10-25T00:00:00Z",
    status: "inprogress",
    subtasks: ["sub1", "sub2", "sub3", "sub4", "sub5", "sub6", "sub7"],
  },
  {
    _id: "task2",
    company: "ytco1",
    taskTemplate: "tt1",
    name: "M3 MacBook Pro Deep Dive Review",
    deadline: "2023-11-24T00:00:00Z",
    startDate: "2023-11-06T00:00:00Z",
    status: "scheduled",
    subtasks: ["sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14"],
  },
  {
    _id: "task3",
    company: "ytco1",
    taskTemplate: "tt2",
    name: "November Growth Push - Smartphone Reviews",
    deadline: "2023-11-30T00:00:00Z",
    startDate: "2023-11-01T00:00:00Z",
    status: "delayed",
    subtasks: ["sub15", "sub16", "sub17"],
  },
];

export const subtasks = [
  {
    _id: "sub1",
    task: "task1",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "completed",
    comment: "Completed competitor analysis",
    startedAt: "2023-10-25T09:00:00Z",
    completedAt: "2023-10-26T18:00:00Z",
  },
  {
    _id: "sub2",
    task: "task1",
    subtaskTemplate: "stt2",
    assignedMember: "mem1",
    status: "completed",
    comment: "Script approved by legal team",
    startedAt: "2023-10-27T10:00:00Z",
    completedAt: "2023-10-27T16:00:00Z",
  },
  {
    _id: "sub3",
    task: "task1",
    subtaskTemplate: "stt3",
    assignedMember: "mem2",
    status: "inprogress",
    comment: "Waiting for final product unit",
    startedAt: "2023-10-30T09:00:00Z",
  },
  {
    _id: "sub4",
    task: "task1",
    subtaskTemplate: "stt4",
    assignedMember: "mem2",
    status: "scheduled",
  },
  {
    _id: "sub5",
    task: "task1",
    subtaskTemplate: "stt5",
    assignedMember: "mem3",
    status: "scheduled",
  },
  // Task 2: MacBook Pro Review
  {
    _id: "sub8",
    task: "task2",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "scheduled",
  },
  // Task 3: Growth Campaign
  {
    _id: "sub15",
    task: "task3",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "delayed",
    comment: "Waiting for Q4 marketing budget approval",
    startedAt: "2023-11-01T09:00:00Z",
  },
  {
    _id: "sub16",
    task: "task3",
    subtaskTemplate: "stt6",
    assignedMember: "mem4",
    status: "scheduled",
  },
];
