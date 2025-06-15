export const companies = [
  {
    _id: "ytco1",
    name: "NextGen Creators",
    description: "YouTube channel team for tech and creative content.",
    createdBy: "user1",
  },
];

export const users = [
  {
    _id: "user1",
    name: "Alex Superadmin",
    email: "alex@nextgen.com",
    password: "hashedPassword1",
    role: "superadmin",
    isVerified: true,
    verificationToken: "token-alex",
  },
  {
    _id: "user2",
    name: "Mira Manager",
    email: "mira@nextgen.com",
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
    name: "Channel Manager",
    description: "Oversees content strategy and analytics.",
    company: "ytco1",
  },
  {
    _id: "role2",
    name: "Video Editor",
    description: "Edits and uploads videos.",
    company: "ytco1",
  },
  {
    _id: "role3",
    name: "Thumbnail Designer",
    description: "Designs engaging thumbnails.",
    company: "ytco1",
  },
];

export const members = [
  {
    _id: "mem1",
    name: "Sam Producer",
    email: "sam@nextgen.com",
    company: "ytco1",
    roles: ["role1"],
  },
  {
    _id: "mem2",
    name: "Jamie Editor",
    email: "jamie@nextgen.com",
    company: "ytco1",
    roles: ["role2"],
  },
  {
    _id: "mem3",
    name: "Taylor Designer",
    email: "taylor@nextgen.com",
    company: "ytco1",
    roles: ["role3"],
  },
];

export const subtaskTemplates = [
  {
    _id: "stt1",
    role: "role1",
    name: "Script Writing",
    description: "Draft and finalize video script.",
    estimatedDurationDays: 2,
  },
  {
    _id: "stt2",
    role: "role2",
    name: "Edit Main Video",
    description: "Edit the video with effects and branding.",
    estimatedDurationDays: 3,
  },
  {
    _id: "stt3",
    role: "role3",
    name: "Design Thumbnail",
    description: "Create a custom thumbnail for the video.",
    estimatedDurationDays: 1,
  },
  {
    _id: "stt4",
    role: "role1",
    name: "Publish & Promote",
    description: "Upload video and schedule/publish on YouTube and socials.",
    estimatedDurationDays: 1,
  },
];

export const taskTemplates = [
  {
    _id: "tt1",
    company: "ytco1",
    name: "Weekly Video Production",
    description: "Produce, edit, and publish a new YouTube video.",
    subtasks: ["stt1", "stt2", "stt3", "stt4"],
  },
];

export const tasks = [
  {
    _id: "task1",
    company: "ytco1",
    taskTemplate: "tt1",
    name: "How to Automate Your Workflow in 2025",
    deadline: "2025-06-20T00:00:00Z",
    startDate: "2025-06-10T00:00:00Z",
    status: "inprogress",
    subtasks: ["sub1", "sub2", "sub3", "sub4"],
  },
  {
    _id: "task2",
    company: "ytco1",
    taskTemplate: "tt1",
    name: "Top 10 Video Editing Tools",
    deadline: "2025-06-27T00:00:00Z",
    startDate: "2025-06-18T00:00:00Z",
    status: "scheduled",
    subtasks: ["sub5", "sub6", "sub7", "sub8"],
  },
  {
    _id: "task3",
    company: "ytco1",
    taskTemplate: "tt1",
    name: "YouTube SEO Tips for Creators",
    deadline: "2025-06-10T00:00:00Z",
    startDate: "2025-06-01T00:00:00Z",
    status: "delayed",
    subtasks: ["sub9", "sub10", "sub11", "sub12"],
  },
];

export const subtasks = [
  // Task 1: In Progress
  {
    _id: "sub1",
    task: "task1",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "completed",
    comment: "Script finalized and approved.",
    startedAt: "2025-06-10T09:00:00Z",
    completedAt: "2025-06-11T16:00:00Z",
  },
  {
    _id: "sub2",
    task: "task1",
    subtaskTemplate: "stt2",
    assignedMember: "mem2",
    status: "inprogress",
    comment: "Editing in progress, adding animations.",
    startedAt: "2025-06-12T10:00:00Z",
  },
  {
    _id: "sub3",
    task: "task1",
    subtaskTemplate: "stt3",
    assignedMember: "mem3",
    status: "scheduled",
  },
  {
    _id: "sub4",
    task: "task1",
    subtaskTemplate: "stt4",
    assignedMember: "mem1",
    status: "scheduled",
  },
  // Task 2: Scheduled
  {
    _id: "sub5",
    task: "task2",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "scheduled",
  },
  {
    _id: "sub6",
    task: "task2",
    subtaskTemplate: "stt2",
    assignedMember: "mem2",
    status: "scheduled",
  },
  {
    _id: "sub7",
    task: "task2",
    subtaskTemplate: "stt3",
    assignedMember: "mem3",
    status: "scheduled",
  },
  {
    _id: "sub8",
    task: "task2",
    subtaskTemplate: "stt4",
    assignedMember: "mem1",
    status: "scheduled",
  },
  // Task 3: Delayed
  {
    _id: "sub9",
    task: "task3",
    subtaskTemplate: "stt1",
    assignedMember: "mem1",
    status: "completed",
    completedAt: "2025-06-02T15:00:00Z",
  },
  {
    _id: "sub10",
    task: "task3",
    subtaskTemplate: "stt2",
    assignedMember: "mem2",
    status: "delayed",
    comment: "Editor sick, editing postponed.",
    startedAt: "2025-06-03T10:00:00Z",
  },
  {
    _id: "sub11",
    task: "task3",
    subtaskTemplate: "stt3",
    assignedMember: "mem3",
    status: "scheduled",
  },
  {
    _id: "sub12",
    task: "task3",
    subtaskTemplate: "stt4",
    assignedMember: "mem1",
    status: "scheduled",
  },
];
