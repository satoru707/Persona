const sortStepsByTitleNumber = (steps) => {
  return [...steps].sort((a, b) => {
    const getNumber = (title) => {
      const match = title.match(/\d+/); // find the first number in the string
      return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
    };

    return getNumber(a.title) - getNumber(b.title);
  });
};

const tasks = [
  {
    title: "Step 1: Initial Assessment",
    description:
      "Clearly define the undefined goal and break it down into smaller, manageable tasks.",
    dueDate: "2025-08-11",
  },
  {
    title: "Step 3:  Planning & Prioritization",
    description:
      "Create a detailed plan outlining each task, prioritizing them based on importance and dependency.",
    dueDate: "2025-08-17",
  },
  {
    title: "Step 4:  Execution - Phase 1",
    description: "Begin working on the highest priority tasks from your plan.",
    dueDate: "2025-08-20",
  },
  {
    title: "Step 9:  Review & Refinement",
    description:
      "Review completed work, identifying areas for improvement or future refinement.",
    dueDate: "2025-09-04",
  },
  {
    title: "Step 5:  Mid-Point Review",
    description:
      "Assess progress, identify any roadblocks, and adjust the plan as needed.",
    dueDate: "2025-08-23",
  },
  {
    title: "Step 2: Resource Gathering",
    description:
      "Identify and gather all necessary resources (information, tools, materials) to achieve the goal.",
    dueDate: "2025-08-14",
  },
  {
    title: "Step 6: Execution - Phase 2",
    description: "Continue working on the remaining high-priority tasks.",
    dueDate: "2025-08-26",
  },
  {
    title: "Step 7:  Problem Solving & Troubleshooting",
    description:
      "Address any challenges encountered during execution, seeking help if necessary.",
    dueDate: "2025-08-29",
  },
  {
    title: "Step 8:  Final Push",
    description:
      "Focus on completing the remaining tasks to meet the deadline.",
    dueDate: "2025-09-01",
  },
  {
    title: "Step 10:  Documentation & Conclusion",
    description:
      "Document the entire process, results achieved, and lessons learned.  Conclude the project.",
    dueDate: "2025-09-05",
  },
];

console.log(sortStepsByTitleNumber(tasks));
