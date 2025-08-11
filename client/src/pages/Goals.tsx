import { useEffect, useState, useRef } from "react";
import { format, differenceInDays } from "date-fns";
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
  Loader2,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";
import { Goal, Step } from "../types";
import { toast } from "sonner";

const URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState<string | null>(null);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    totalDays: 0,
    createdAt: new Date().toISOString(),
    userId: "",
    steps: [],
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOptionsModalOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOptionsModalOpen]);

  useEffect(() => {
    setNewGoal((prev) => ({ ...prev, steps }));
  }, [steps]);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const { data } = await axios.get(`${URL}/api/goals`);
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
        toast.error("Failed to fetch goals");
      }
    }
    fetchGoals();
  }, []);

  const handleReset = async (id: string) => {
    try {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      await Promise.all(
        goal.steps.map((step) =>
          axios.put(`${URL}/api/goals/steps/${step.id}`, {
            isCompleted: false,
            skippedIsImportant: false,
            skippedReason: null,
          })
        )
      );
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                steps: g.steps.map((s) => ({ ...s, isCompleted: false })),
              }
            : g
        )
      );
      setExpandedGoal(null);
      setOptionsModalOpen(null);
      toast.success("Goal reset successfully");
    } catch (error) {
      console.error("Error resetting goal:", error);
      toast.error("Failed to reset goal");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { data } = await axios.get(`${URL}/api/goals/${id}`);
      setNewGoal(data);
      setSteps(data.steps);
      setShowNewGoalModal(true);
      setExpandedGoal(null);
      setOptionsModalOpen(null);
    } catch (error) {
      console.error("Error fetching goal for edit:", error);
      toast.error("Failed to load goal for editing");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${URL}/api/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setExpandedGoal(null);
      setOptionsModalOpen(null);
      setOptionsModalOpen(null);
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const completeStep = async (id: string) => {
    try {
      await axios.put(`${URL}/api/goals/steps/${id}`, { isCompleted: true });
      setGoals((prev) =>
        prev.map((g) => ({
          ...g,
          steps: g.steps.map((s) =>
            s.id === id ? { ...s, isCompleted: true } : s
          ),
        }))
      );
      toast.success("Step marked as complete");
    } catch (error) {
      console.error("Error completing step:", error);
      toast.error("Failed to mark step as complete");
    }
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: `${prev.length + 1}`,
        title: "",
        description: "",
        dueDate: new Date().toISOString(),
        isCompleted: false,
        // goalId: newGoal.id || '',
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = <K extends keyof Step>(
    index: number,
    field: K,
    value: Step[K]
  ) => {
    setSteps((prev) => {
      const updatedSteps = [...prev];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      return updatedSteps;
    });
  };

  const sortStepsByTitleNumber = (steps: Step[]) => {
    return [...steps].sort((a, b) => {
      const getNumber = (title: string) => {
        const match = title.match(/\d+/);
        return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
      };

      return getNumber(a.title) - getNumber(b.title);
    });
  };

  const formatDateToYMD = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const convertYMDToISOString = (ymdString: string): string => {
    try {
      const date = new Date(`${ymdString}T00:00:00Z`);
      return isNaN(date.getTime())
        ? new Date().toISOString()
        : date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.totalDays) {
      console.log("Please fill out goal title and valid time frame");
      return;
    }
    try {
      const payload = { ...newGoal, steps };
      const { data } = await axios.post(`${URL}/api/goals`, payload);
      setGoals((prev) => [...prev, data]);
      setShowNewGoalModal(false);
      setNewGoal({
        id: "",
        title: "",
        description: "",
        totalDays: 0,
        createdAt: new Date().toISOString(),
        userId: "",
        steps: [],
      });
      setSteps([]);
      toast.success("Goal created successfully");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.id || !newGoal.title || newGoal.totalDays || 0 <= 0) {
      toast.error("Please fill out goal title and valid time frame");
      return;
    }
    try {
      const payload = { ...newGoal, steps };
      await axios.put(`${URL}/api/goals/${newGoal.id}`, payload);
      await Promise.all(
        steps.map((step) =>
          axios.put(`${URL}/api/goals/steps/${step.id}`, step)
        )
      );
      setGoals((prev) =>
        prev.map((g) =>
          g.id === newGoal.id ? { ...payload, id: newGoal.id } : g
        )
      );
      setShowNewGoalModal(false);
      setNewGoal({
        id: "",
        title: "",
        description: "",
        totalDays: 0,
        createdAt: new Date().toISOString(),
        userId: "",
        steps: [],
      });
      setSteps([]);
      toast.success("Goal updated successfully");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const generateSteps = async (
    goal: string,
    days: number,
    stepCount: number
  ) => {
    if (!goal.trim() || days <= 0 || stepCount <= 0) {
      toast.error("Please provide a goal, valid time frame, and step count");
      return;
    }
    try {
      setGeneratingSteps(true);

      const { data } = await axios.post(`${API_URL}/api/ai/generate-steps`, {
        goal,
        totalDays: days,
      });
      setSteps(data.steps);
      toast.success("Steps generated successfully");
    } catch (error) {
      console.error("Error generating steps:", error);
      toast.error("Error generating steps");
    } finally {
      setGeneratingSteps(false);
    }
  };

  const toggleExpandGoal = (goalId: string | null) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
    setOptionsModalOpen(null);
  };

  const toggleExpandOption = (optId: string | null) => {
    setOptionsModalOpen(optionsModalOpen === optId ? null : optId);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen" ref={modalRef}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Goals
        </h1>
        <button
          className="btn btn-accent flex items-center gap-2 text-gray-900 dark:text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
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
            const isOpened = optionsModalOpen === goal.id;
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
            if (!goal.totalDays) return;

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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {goal.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium">
                        {progressPercentage}%
                      </span>
                      <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                          <MoreHorizontal
                            onClick={() => {
                              toggleExpandOption(`${goal.id}`);
                            }}
                            className="h-5 w-5 text-gray-600 dark:text-gray-400"
                          />
                        </button>
                        <AnimatePresence>
                          {isOpened && (
                            <motion.div
                              ref={dropdownRef}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
                            >
                              <button
                                onClick={() => handleReset(`${goal.id}`)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset Goal
                              </button>
                              <button
                                onClick={() => handleEdit(`${goal.id}`)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Goal
                              </button>
                              <button
                                onClick={() => handleDelete(`${goal.id}`)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
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
                      <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-300">
                        <span>Progress</span>
                        <span>
                          {completedSteps}/{goal.steps.length} steps
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-300">
                        <span>Time</span>
                        <span>
                          {remainingDays > 0
                            ? `${remainingDays} days left`
                            : "Deadline passed"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            timePercentage > 75
                              ? "bg-red-600 dark:bg-red-500"
                              : timePercentage > 50
                              ? "bg-yellow-600 dark:bg-yellow-500"
                              : "bg-green-600 dark:bg-green-500"
                          }`}
                          style={{ width: `${timePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full mt-4 flex items-center justify-center p-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    onClick={() =>
                      toggleExpandGoal(isExpanded ? null : `${goal.id}`)
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
                    className="bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
                  >
                    <h3 className="text-sm font-medium mb-4 text-gray-900 dark:text-white">
                      Steps
                    </h3>
                    <div className="space-y-3">
                      {sortStepsByTitleNumber(goal.steps).map((step, index) => (
                        <div
                          key={step.id}
                          className={`p-3 rounded-md flex items-start gap-3 ${
                            step.isCompleted
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {step.isCompleted ? (
                              <div className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-xs text-gray-900 dark:text-white">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4
                                  className={`font-medium text-gray-900 dark:text-white ${
                                    step.isCompleted
                                      ? "line-through opacity-70"
                                      : ""
                                  }`}
                                >
                                  {step.title}
                                </h4>
                                {step.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
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
                                  className="text-xs px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50"
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
          <div className="p-3 rounded-md bg-white dark:bg-gray-800 text-center">
            <h3 className="font-medium text-gray-900 dark:text-white">
              No goals found
            </h3>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {newGoal.id ? "Edit Goal" : "New Goal"}
              </h2>
              <button
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowNewGoalModal(false);
                  setNewGoal({
                    id: "",
                    title: "",
                    description: "",
                    totalDays: 0,
                    createdAt: new Date().toISOString(),
                    userId: "",
                    steps: [],
                  });
                  setSteps([]);
                }}
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Goal Title
                </label>
                <input
                  type="text"
                  className="input w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Description (optional)
                </label>
                <textarea
                  className="input w-full h-24 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your goal in detail"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Time Frame (days)
                </label>
                <input
                  type="number"
                  className="input w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="30"
                  min="1"
                  value={newGoal.totalDays || ""}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      totalDays: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
                  Steps
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
                  You can define your own steps or let the AI generate 10 steps
                  for you.
                </p>
                <button
                  type="button"
                  className="w-full btn bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 mb-4"
                  onClick={() =>
                    generateSteps(
                      newGoal.title || newGoal.description || "",
                      newGoal.totalDays || 0,
                      10
                    )
                  }
                >
                  {generatingSteps ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Generate Steps with AI"
                  )}
                </button>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Step {index + 1}
                        </span>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            onClick={() => removeStep(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="input w-full text-sm mb-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Step ${index + 1} title`}
                        value={step.title}
                        onChange={(e) =>
                          updateStep(index, "title", e.target.value)
                        }
                      />
                      <textarea
                        className="input w-full text-sm mb-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Step ${index + 1} description (optional)`}
                        value={step.description}
                        onChange={(e) =>
                          updateStep(index, "description", e.target.value)
                        }
                      />
                      <input
                        type="date"
                        className="input w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={formatDateToYMD(step.dueDate)}
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
                  className="w-full mt-3 p-2 text-sm rounded-md border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  onClick={addStep}
                >
                  + Add Step
                </button>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  className="btn bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  onClick={() => setShowNewGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-600 text-white"
                  onClick={(e) =>
                    newGoal.id ? handleUpdateGoal(e) : handleCreateGoal(e)
                  }
                >
                  {newGoal.id ? "Update Goal" : "Create Goal"}
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
