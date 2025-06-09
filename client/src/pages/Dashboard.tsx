import { useEffect, useState, useRef } from "react";
// import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import runDailyNotifications from "../store/notis";
// import {
//   Event,
//   Goal,
//   AiSuggestion,
// } from "../types";
import axios from "axios";
import { API_URL } from "../config";
import "../index.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [suggestions, setInsights] = useState([]);
  const [goalProgressData, setGoalProgressData] = useState([]);
  const [weeklyCompletionData, setWeeklyCompletionData] = useState([]);
  const [specialEventsData, setSpecialEventsData] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const hasFetched = useRef(false);
  const notisCalled = useRef(false);

  // function getWeekdayAbbreviation(dateString) {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Tue"
  // }

  function getImportantSkippedEvents(events) {
    const filtered = events.filter((event) => event.skippedIsImportant);

    const titleCountMap = {};

    filtered.forEach((event) => {
      const title = event.title;
      titleCountMap[title] = (titleCountMap[title] || 0) + 1;
    });

    const result = Object.entries(titleCountMap).map(([title, count]) => ({
      name: title,
      value: count,
    }));

    return result;
  }

  function getWeeklyCompletionData(stepsArray: any) {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize weekly result
    const weeklyData = {
      Sun: { day: "Sun", completed: 0, skipped: 0 },
      Mon: { day: "Mon", completed: 0, skipped: 0 },
      Tue: { day: "Tue", completed: 0, skipped: 0 },
      Wed: { day: "Wed", completed: 0, skipped: 0 },
      Thu: { day: "Thu", completed: 0, skipped: 0 },
      Fri: { day: "Fri", completed: 0, skipped: 0 },
      Sat: { day: "Sat", completed: 0, skipped: 0 },
    };

    for (const step of stepsArray) {
      const date = new Date(step.startTime);
      const dayKey = dayMap[date.getUTCDay()]; // getUTCDay() gives 0-6 (Sun-Sat)

      if (step.isCompleted) {
        weeklyData[dayKey].completed++;
      }

      if (step.skippedIsImportant) {
        weeklyData[dayKey].skipped++;
      }
    }

    return Object.values(weeklyData);
  }

  useEffect(() => {
    async function getEvents() {
      const { data } = await axios.get(`${API_URL}/api/events`);
      const now = new Date();

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday = 0
      startOfWeek.setHours(0, 0, 0, 0); // Start of the day

      const filtered = data.filter((item) => {
        const endTime = new Date(item.endTime);
        return endTime < now && endTime >= startOfWeek;
      });

      const week = getWeeklyCompletionData(filtered);
      setWeeklyCompletionData(week);
      const specia = getImportantSkippedEvents(filtered);
      setSpecialEventsData(specia);
    }
    getEvents();
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    async function getEvents() {
      const { data } = await axios.get(`${API_URL}/api/events/upcoming`);
      hasFetched.current = true;
      await runDailyNotifications(data, []);
      setUpcoming(data);
    }

    getEvents();
  }, []);

  // useEffect(() => {
  //   async function runNotis() {
  //     if (notisCalled.current || !upcoming || !suggestions) return;

  //     notisCalled.current = true; // Mark as called immediately
  //     await runDailyNotifications(upcoming, suggestions);
  //   }

  //   runNotis();
  // }, [upcoming, suggestions]);
  // const specialEventsData = [
  //   { name: "Business Networking", value: 3 },
  //   { name: "Learning Session", value: 4 },
  //   { name: "Family Time", value: 2 },
  //   { name: "Personal Project", value: 1 },
  // ];
  // console.log(events);

  // Fetch active goals
  useEffect(() => {
    async function getEvents() {
      const { data } = await axios.get(`${API_URL}/api/goals`);
      setGoals(data);

      const arr: any = [];
      data.map((goal) => {
        const completedSteps = goal.steps.filter(
          (step) => step.isCompleted
        ).length;
        arr.push({
          id: goal.id,
          name: goal.title,
          progress: ((completedSteps / goal.steps.length) * 100).toFixed(0),
        });
      });
      setGoalProgressData(arr);
    }
    getEvents();
  }, []);

  // Fetch AI suggestions
  useEffect(() => {
    async function getEvents() {
      const { data } = await axios.get(`${API_URL}/api/ai/suggestions`);
      setInsights(data);
    }

    getEvents();
  }, []);
  const navigate = useNavigate();
  // Mock data for demo
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // useEffect(() => {
  //   async function run() {
  //     await runDailyNotifications(upcoming, suggestions);
  //     console.log(upcoming);
  //   }

  //   if (upcoming) {
  //     run();
  //     console.log("ran");
  //   }
  // }, [upcoming, suggestions]);
  let perc: number = 0;
  const percentag = goalProgressData.map(
    (goal) => (perc += parseInt(goal.progress))
  );

  const percentage = percentag[goalProgressData.length - 1];

  const totalSpecialEvents = specialEventsData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const totalCompleted = weeklyCompletionData.reduce(
    (sum, day) => sum + day.completed,
    0
  );
  const totalSkipped = weeklyCompletionData.reduce(
    (sum, day) => sum + day.skipped,
    0
  );
  const completionRate = Math.round(
    (totalCompleted / (totalCompleted + totalSkipped)) * 100
  );

  // Mock data
  // const mockEvents: Event[] = [
  //   {
  //     id: "1",
  //     title: "Team Standup",
  //     description: "Daily team standup meeting",
  //     startTime: new Date(new Date().setHours(10, 0, 0, 0)),
  //     endTime: new Date(new Date().setHours(10, 30, 0, 0)),
  //     isCompleted: false,
  //     skippedIsImportant: false,
  //     isSpecial: false,
  //     userId: "1",
  //   },
  //   {
  //     id: "2",
  //     title: "Design Review",
  //     description: "Review new product designs with stakeholders",
  //     startTime: new Date(new Date().setHours(13, 0, 0, 0)),
  //     endTime: new Date(new Date().setHours(14, 0, 0, 0)),
  //     isCompleted: false,
  //     skippedIsImportant: false,
  //     isSpecial: false,
  //     userId: "1",
  //   },
  //   {
  //     id: "3",
  //     title: "Workout Session",
  //     description: "Gym time - focus on cardio",
  //     startTime: new Date(new Date().setHours(18, 0, 0, 0)),
  //     endTime: new Date(new Date().setHours(19, 0, 0, 0)),
  //     isCompleted: false,
  //     skippedIsImportant: false,
  //     isSpecial: false,
  //     userId: "1",
  //   },
  // ];

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
  //         id: "4",
  //         title: "Complete basics course",
  //         description: "Finish Python basics on Codecademy",
  //         dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
  //         isCompleted: true,
  //         goalId: "2",
  //       },
  //       {
  //         id: "5",
  //         title: "Build CLI tool",
  //         description: "Create a command-line application",
  //         dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
  //         isCompleted: false,
  //         goalId: "2",
  //       },
  //     ],
  //   },
  // ];

  // const mockSuggestions: AiSuggestion[] = [
  //   {
  //     message:
  //       "Consider scheduling a 15-minute break after your Design Review meeting to process insights.",
  //     type: "schedule",
  //   },
  //   {
  //     message:
  //       "Based on your progress, focus on the 'Develop prototype' step of your Website Redesign goal today.",
  //     type: "focus",
  //   },
  //   {
  //     message:
  //       "You're consistently completing your morning tasks. Great job maintaining your routine!",
  //     type: "focus",
  //   },
  // ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-lg bg-card animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Today's Schedule
              </h2>
              <span className="text-sm text-foreground/70">
                {format(new Date(), "EEEE, MMMM d")}
              </span>
            </div>

            <div className="space-y-4">
              {upcoming.length > 0 ? (
                upcoming.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-secondary rounded-md"
                  >
                    <div className="min-w-[40px] flex flex-col items-center">
                      <Clock className="h-5 w-5 text-accent mb-1" />
                      <span className="text-xs text-foreground/70">
                        {format(new Date(event?.startTime), "HH:mm")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-foreground/70 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto text-sm text-foreground/60">
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-md">
                  <div className="flex justify-center mb-2 items-center text-center">
                    <h3 className="font-medium">No active event</h3>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/auths/timetable")}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              View Full Schedule
            </button>
          </motion.div>

          {/* Active Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Active Goals
              </h2>
              <span
                className="text-sm text-accent cursor-pointer "
                onClick={() => navigate("/auths/goals")}
              >
                {goals ? "Don't sleep on it" : "Create goals"}
              </span>
            </div>

            <div className="space-y-4">
              {goals.length > 0 ? (
                goals.slice(0, 4).map((goal) => {
                  // console.log(goal);

                  const completedSteps = goal?.steps?.filter(
                    (step) => step.isCompleted
                  ).length;
                  const progressPercentage = Math.round(
                    (completedSteps / goal?.steps?.length) * 100
                  );

                  return (
                    <div key={goal?.id} className="p-3 bg-secondary rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{goal?.title}</h3>
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                          {progressPercentage}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      <div className="mt-3 text-sm text-foreground/70">
                        Next step:{" "}
                        {goal?.steps?.find((step) => !step.isCompleted)
                          ?.title || "All steps completed!"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3  rounded-md">
                  <div className="flex justify-center mb-2 items-center text-center">
                    <h3 className="font-medium">No active goals</h3>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/auths/goals")}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              View All Goals
            </button>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                AI Insights
              </h2>
            </div>

            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.slice(0, 4).map((suggestion, index) => (
                  <div key={index} className="p-3 bg-secondary rounded-md">
                    <div className="flex items-start gap-3">
                      {suggestion.type === "schedule" && (
                        <Calendar className="h-5 w-5 text-accent shrink-0" />
                      )}
                      {suggestion.type === "goal" && (
                        <Target className="h-5 w-5 text-accent shrink-0" />
                      )}
                      {suggestion.type === "focus" && (
                        <Activity className="h-5 w-5 text-accent shrink-0" />
                      )}
                      <p className="text-sm">{suggestion.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-md">
                  <div className="flex justify-center mb-2 items-center text-center">
                    <h3 className="font-medium">No AI insights</h3>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                const { data } = await axios.get(
                  `${API_URL}/api/ai/suggestions`
                );
                setInsights(data);
              }}
              className="w-full mt-4 py-2 text-sm bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              Generate New Insights
            </button>
          </motion.div>

          {/* Weekly Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1 md:col-span-2 lg:col-span-3 bg-card rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Weekly Summary</h2>
              <span className="text-sm text-foreground/70">
                {format(new Date(), "MMMM d, yyyy")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Events Completed</h3>
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {" "}
                  {totalCompleted}/{totalCompleted + totalSkipped}
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  {completionRate || 0}% completion rate
                </p>
              </div>

              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Special Events</h3>
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold mt-2">{totalSpecialEvents}</p>
                <p className="text-xs text-foreground/70 mt-1">
                  0 more than last week
                </p>
              </div>

              <div className="bg-secondary p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Goal Progress</h3>
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {" "}
                  {percentage
                    ? (percentage / goalProgressData.length).toFixed(1) + "%"
                    : 0 + "%"}
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  On track for completion
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
