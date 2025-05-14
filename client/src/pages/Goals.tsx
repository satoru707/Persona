/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { format, differenceInDays, set } from "date-fns";
import {
  Clock,
  Plus,
  Check,
  X,
  MoreHorizontal,
  ChevronRight,
  RotateCcw,
  Pencil,
  Trash,
} from "lucide-react";
import { Goal } from "../types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";
// import { option } from "framer-motion/client";

// const mockGoals: Goal[] = [
//   {
//     id: "1",
//     title: "Website Redesign",
//     description: "Complete redesign of company website",
//     totalDays: 30,
//     createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
//     userId: "1",
//     steps: [
//       {
//         id: "1",
//         title: "Research competitors",
//         description: "Analyze top 5 competitors",
//         dueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
//         isCompleted: true,
//         goalId: "1",
//       },
//       {
//         id: "2",
//         title: "Create wireframes",
//         description: "Design initial wireframes for key pages",
//         dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
//         isCompleted: true,
//         goalId: "1",
//       },
//       {
//         id: "3",
//         title: "Develop prototype",
//         description: "Build interactive prototype",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "4",
//         title: "Gather feedback",
//         description: "Collect feedback from stakeholders",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "5",
//         title: "Implement revisions",
//         description: "Make changes based on feedback",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "6",
//         title: "Develop final design",
//         description: "Create final design for all pages",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "7",
//         title: "Front-end development",
//         description: "Implement HTML/CSS/JS",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 23)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "8",
//         title: "Back-end integration",
//         description: "Connect to CMS and database",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 26)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "9",
//         title: "Testing and QA",
//         description: "Perform thorough testing across browsers",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 28)),
//         isCompleted: false,
//         goalId: "1",
//       },
//       {
//         id: "10",
//         title: "Launch website",
//         description: "Deploy to production",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
//         isCompleted: false,
//         goalId: "1",
//       },
//     ],
//   },
//   {
//     id: "2",
//     title: "Learn Python",
//     description: "Master Python programming language",
//     totalDays: 60,
//     createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
//     userId: "1",
//     steps: [
//       {
//         id: "11",
//         title: "Complete basics course",
//         description: "Finish Python basics on Codecademy",
//         dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
//         isCompleted: true,
//         goalId: "2",
//       },
//       {
//         id: "12",
//         title: "Build CLI tool",
//         description: "Create a command-line application",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "13",
//         title: "Learn data structures",
//         description: "Study lists, dictionaries, sets, etc.",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 8)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "14",
//         title: "Practice algorithms",
//         description: "Solve 20 algorithm problems",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "15",
//         title: "Learn OOP concepts",
//         description: "Study classes, inheritance, polymorphism",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 25)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "16",
//         title: "Build web app with Flask",
//         description: "Create a simple web application",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 35)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "17",
//         title: "Learn data analysis",
//         description: "Study pandas and numpy",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 42)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "18",
//         title: "Visualization with matplotlib",
//         description: "Create data visualizations",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 48)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "19",
//         title: "Machine learning basics",
//         description: "Introduction to scikit-learn",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 55)),
//         isCompleted: false,
//         goalId: "2",
//       },
//       {
//         id: "20",
//         title: "Final project",
//         description: "Build a complete application",
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
//         isCompleted: false,
//         goalId: "2",
//       },
//     ],
//   },
// ];
const URL = API_URL || "http://localhost:3000";
const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [optionsMoalOpen, setOptionsModalOpen] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    totalDays: 0,
    steps: [],
  });
  //Steps = steps, steps = stepa
  const [stepa, setSteps] = useState([
    {
      id: 0,
      title: "",
      description: "",
      dueDate: "",
      isCompleted: false,
    },
  ]);
  //im given the goal id
  async function handleReset(id: string) {
    const work = goals.find((goal) => goal.id === id);
    async function req(id: string) {
      await axios.put(`${URL}/api/goals/steps/${id}`, {
        isCompleted: false,
        skippedIsImportant: false,
        skippedReason: null,
      });
    }
    work?.steps.map((step) => req(step.id));
    setExpandedGoal(null);
  }
  function formatDateToYMD(dateString: string) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0"); // add leading 0
    const day = `${date.getDate()}`.padStart(2, "0"); // add leading 0

    return `${year}-${month}-${day}`;
  }

  function convertYMDToISOString(ymdString: string) {
    const date = new Date(`${ymdString}T00:00:00Z`);
    return date.toISOString();
  }

  async function handleEdit(id: number) {
    // await axios.put(`${URL}/api/goals/${id}`);
    const { data } = await axios.get(`${URL}/api/goals/${id}`);
    setNewGoal(data);
    setSteps(data.steps);
    setShowNewGoalModal(true);
    setExpandedGoal(null);
  }

  async function handleDelete(id: string | number) {
    await axios.delete(`${URL}/api/goals/${id}`);
    setExpandedGoal(null);
  }

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: "",
        description: "",
        dueDate: "",
        isCompleted: false,
      },
    ]);
  };

  // Remove last step
  const removeStep = (indexToRemove: any) => {
    setSteps((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOptionsModalOpen(false);
      }
    };

    if (optionsMoalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsMoalOpen]);

  function isISOString(str) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return typeof str === "string" && isoRegex.test(str);
  }

  // Update individual step
  const updateStep = (index: any, field: any, value: any) => {
    const updatedSteps = [...stepa];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  async function completeStep(id: any) {
    await axios.put(`${URL}/api/goals/steps/${id}`, { isCompleted: true });
  }

  useEffect(() => {
    async function request() {
      const { data } = await axios.get(`${URL}/api/goals`);
      setGoals(data);
    }
    request();
  }, [
    //add some stuffs
    completeStep,
    handleDelete,
    handleReset,
    handleEdit,
    handleUpdateGoal,
  ]);
  // Toggle expanded goal
  const toggleExpandGoal = (goalId: string | null) => {
    if (optionsMoalOpen === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };

  const toggleExpandOption = (optId: string | null) => {
    if (optionsMoalOpen) {
      setOptionsModalOpen(null);
    } else {
      setOptionsModalOpen(optId);
    }
  };

  useEffect(() => {
    setNewGoal((prev) => ({
      ...prev,
      steps: stepa,
    }));
  }, [stepa]);

  async function handleCreateGoal(e) {
    e.preventDefault();
    setShowNewGoalModal(false);
    console.log(newGoal);

    const { data } = await axios.post(`${URL}/api/goals`, newGoal);
    setGoals((prev) => [...prev, data]);
    setNewGoal({
      title: "",
      description: "",
      totalDays: 0,
      steps: [],
    });
    setSteps([
      {
        id: 0,
        title: "",
        description: "",
        dueDate: "",
        isCompleted: false,
      },
    ]);
  }

  async function handleUpdateGoal(e: any) {
    e.preventDefault();
    setShowNewGoalModal(false);
    console.log(newGoal);

    await axios.put(`${URL}/api/goals/${newGoal.id}`, newGoal);
    async function req(stap: any) {
      await axios.put(`${URL}/api/goals/steps/${stap.id}`, stap);
    }
    newGoal.steps.map((step) => req(step));
  }

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
        {goals.length > 0 ? (
          goals.map((goal) => {
            const isExpanded = expandedGoal === goal.id;
            const isOpened = optionsMoalOpen === goal.id;
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
                      <div className="relative">
                        <button className="p-2 rounded-full hover:bg-secondary">
                          <MoreHorizontal
                            onClick={() => toggleExpandOption(goal.id)}
                            className="h-5 w-5"
                          />
                        </button>

                        <AnimatePresence>
                          {isOpened && (
                            <motion.div
                              ref={dropdownRef}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-0 mt-2 w-44 bg-card rounded-md shadow-lg z-50 border border-border"
                            >
                              <button
                                onClick={() => handleReset(goal.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-secondary rounded-md"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset Goal
                              </button>

                              <button
                                onClick={() => handleEdit(goal.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-secondary rounded-md"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Goal
                              </button>

                              <button
                                onClick={() => handleDelete(goal.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-secondary rounded-md"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Goal
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
                    onClick={() =>
                      toggleExpandGoal(isExpanded ? null : goal.id)
                    }
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
                                <button
                                  onClick={() => completeStep(step.id)}
                                  className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                                >
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
          })
        ) : (
          <div className="p-3  rounded-md">
            <div className="flex justify-center mb-2 items-center text-center">
              <h3 className="font-medium">No goals found</h3>
            </div>
          </div>
        )}
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
                onClick={() => {
                  setShowNewGoalModal(false);
                  setNewGoal({
                    title: "",
                    description: "",
                    totalDays: 0,
                    steps: [],
                  });
                  setSteps([
                    {
                      id: 0,
                      title: "",
                      description: "",
                      dueDate: "",
                      isCompleted: false,
                    },
                  ]);
                }}
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
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="input w-full h-24"
                  placeholder="Describe your goal in detail"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
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
                  value={newGoal.totalDays}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      totalDays: parseInt(e.target.value),
                    })
                  }
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
                  onClick={() => console.log("Generate steps")}
                >
                  Generate Steps with AI
                </button>

                <div className="space-y-3">
                  {stepa.map((step, index) => (
                    <div key={step.id} className="p-3 bg-secondary rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Step {index + 1}
                        </span>
                        {stepa.length > 1 && (
                          <button
                            type="button"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => removeStep(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="input w-full text-sm mb-2"
                        placeholder={`Step ${index + 1} title`}
                        value={step.title}
                        onChange={(e) =>
                          updateStep(index, "title", e.target.value)
                        }
                      />
                      <textarea
                        className="input w-full text-sm mb-2"
                        placeholder={`Step ${index + 1} description (optional)`}
                        value={step.description}
                        onChange={(e) =>
                          updateStep(index, "description", e.target.value)
                        }
                      />
                      <input
                        type="date"
                        className="input w-full text-sm"
                        value={formatDateToYMD(step.dueDate) || step.dueDate}
                        onChange={(e) =>
                          updateStep(
                            index,
                            "dueDate",
                            convertYMDToISOString(e.target.value)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full mt-3 p-2 text-sm rounded-md border border-dashed border-border hover:bg-secondary"
                  onClick={addStep}
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
                  onClick={(e) =>
                    !isISOString(newGoal.steps[0].dueDate)
                      ? handleCreateGoal(e)
                      : handleUpdateGoal(e)
                  }
                >
                  {!isISOString(newGoal.steps[0].dueDate)
                    ? "Create Goal"
                    : "Edit Goal"}
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
