import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
  Target,
  Clock,
  Plus,
  Check,
  X,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Goal } from "../types";

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete redesign of company website",
    totalDays: 30,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    userId: "1",
    steps: [
      {
        id: "1",
        title: "Research competitors",
        description: "Analyze top 5 competitors",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        isCompleted: true,
        goalId: "1",
      },
      {
        id: "2",
        title: "Create wireframes",
        description: "Design initial wireframes for key pages",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        isCompleted: true,
        goalId: "1",
      },
      {
        id: "3",
        title: "Develop prototype",
        description: "Build interactive prototype",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "4",
        title: "Gather feedback",
        description: "Collect feedback from stakeholders",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "5",
        title: "Implement revisions",
        description: "Make changes based on feedback",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "6",
        title: "Develop final design",
        description: "Create final design for all pages",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "7",
        title: "Front-end development",
        description: "Implement HTML/CSS/JS",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 23)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "8",
        title: "Back-end integration",
        description: "Connect to CMS and database",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 26)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "9",
        title: "Testing and QA",
        description: "Perform thorough testing across browsers",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 28)),
        isCompleted: false,
        goalId: "1",
      },
      {
        id: "10",
        title: "Launch website",
        description: "Deploy to production",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        isCompleted: false,
        goalId: "1",
      },
    ],
  },
  {
    id: "2",
    title: "Learn Python",
    description: "Master Python programming language",
    totalDays: 60,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
    userId: "1",
    steps: [
      {
        id: "11",
        title: "Complete basics course",
        description: "Finish Python basics on Codecademy",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        isCompleted: true,
        goalId: "2",
      },
      {
        id: "12",
        title: "Build CLI tool",
        description: "Create a command-line application",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "13",
        title: "Learn data structures",
        description: "Study lists, dictionaries, sets, etc.",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 8)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "14",
        title: "Practice algorithms",
        description: "Solve 20 algorithm problems",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "15",
        title: "Learn OOP concepts",
        description: "Study classes, inheritance, polymorphism",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 25)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "16",
        title: "Build web app with Flask",
        description: "Create a simple web application",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 35)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "17",
        title: "Learn data analysis",
        description: "Study pandas and numpy",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 42)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "18",
        title: "Visualization with matplotlib",
        description: "Create data visualizations",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 48)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "19",
        title: "Machine learning basics",
        description: "Introduction to scikit-learn",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 55)),
        isCompleted: false,
        goalId: "2",
      },
      {
        id: "20",
        title: "Final project",
        description: "Build a complete application",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
        isCompleted: false,
        goalId: "2",
      },
    ],
  },
];

const Goals = () => {
  const [goals] = useState<Goal[]>(mockGoals);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Toggle expanded goal
  const toggleExpandGoal = (goalId: string) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Goals</h1>
        <button
          className="btn btn-accent flex items-center gap-2"
          onClick={() => setShowNewGoalModal(true)}
        >
          <Plus className="h-5 w-5" />
          New Goal
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {goals.map((goal) => {
          const isExpanded = expandedGoal === goal.id;
          const completedSteps = goal.steps.filter(
            (step) => step.isCompleted
          ).length;
          const progressPercentage = Math.round(
            (completedSteps / goal.steps.length) * 100
          );
          const elapsedDays = differenceInDays(
            new Date(),
            new Date(goal.createdAt)
          );
          const remainingDays = goal.totalDays - elapsedDays;
          const timePercentage = Math.min(
            100,
            Math.round((elapsedDays / goal.totalDays) * 100)
          );

          return (
            <motion.div
              key={goal.id}
              layout
              animate={{ height: "auto" }}
              className="bg-card rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{goal.title}</h2>
                    <p className="text-foreground/70 mt-1">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                      {progressPercentage}%
                    </span>
                    <button className="p-2 rounded-full hover:bg-secondary">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {completedSteps}/{goal.steps.length} steps
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time</span>
                      <span>
                        {remainingDays > 0
                          ? `${remainingDays} days left`
                          : "Deadline passed"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          timePercentage > 75
                            ? "bg-destructive"
                            : timePercentage > 50
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                        style={{ width: `${timePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-4 flex items-center justify-center p-2 text-sm rounded-md bg-secondary hover:bg-secondary/80"
                  onClick={() => toggleExpandGoal(goal.id)}
                >
                  <span>{isExpanded ? "Hide Steps" : "Show Steps"}</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-1 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-secondary/50 border-t border-border px-6 py-4"
                >
                  <h3 className="text-sm font-medium mb-4">Steps</h3>

                  <div className="space-y-3">
                    {goal.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-md flex items-start gap-3 ${
                          step.isCompleted ? "bg-success/10" : "bg-secondary"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {step.isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-foreground/30 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4
                                className={`font-medium ${
                                  step.isCompleted
                                    ? "line-through opacity-70"
                                    : ""
                                }`}
                              >
                                {step.title}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-foreground/70 mt-1">
                                  {step.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-foreground/70">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {format(new Date(step.dueDate), "MMM d")}
                              </span>
                            </div>
                          </div>

                          {!step.isCompleted && (
                            <div className="mt-2">
                              <button className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30">
                                Mark Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Goal</h2>
              <button
                className="p-1 rounded-full hover:bg-secondary"
                onClick={() => setShowNewGoalModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="input w-full h-24"
                  placeholder="Describe your goal in detail"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Frame (days)
                </label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="30"
                  min="1"
                />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Steps</h3>
                <p className="text-xs text-foreground/70 mb-4">
                  You can define your own steps or let the AI generate 10 steps
                  for you.
                </p>

                <button
                  type="button"
                  className="w-full btn bg-accent/20 text-accent hover:bg-accent/30 mb-4"
                >
                  Generate Steps with AI
                </button>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-secondary rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Step {i}</span>
                        <button
                          type="button"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        className="input w-full text-sm mb-2"
                        placeholder={`Step ${i} title`}
                      />
                      <input type="date" className="input w-full text-sm" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full mt-3 p-2 text-sm rounded-md border border-dashed border-border hover:bg-secondary"
                >
                  + Add Step
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  className="btn bg-secondary hover:bg-secondary/90"
                  onClick={() => setShowNewGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => setShowNewGoalModal(false)}
                >
                  Create Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;
