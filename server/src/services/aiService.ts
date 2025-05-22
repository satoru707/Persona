import { GoogleGenerativeAI } from "@google/generative-ai";
import { Event, Goal, Step } from "@prisma/client";

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate event suggestions
export const generateEventSuggestions = async (events: Event[]) => {
  if (!process.env.GEMINI_API_KEY || events.length === 0) {
    return null;
  }

  try {
    const eventsText = events
      .map(
        (event) =>
          `Title: ${event.title}, Description: ${
            event.description || "N/A"
          }, Time: ${formatDateTime(event.startTime)} - ${formatDateTime(
            event.endTime
          )}`
      )
      .join("\n");

    const prompt = `
      I have the following schedule events:
      ${eventsText}
      
      Please suggest subtle improvements to my schedule (e.g., adding breaks, better time distribution, or event reordering) to make it more balanced and effective.
      Only suggest reasonable changes, don't completely reorganize everything.
      Provide 1-2 concise, specific suggestions in a JSON array with this format:
      [
        {"message": "Add a 15-minute break after your meeting", "type": "schedule"}
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error("Event Suggestion Generation Error:", error);
    return null;
  }
};

// Generate goal step suggestions
export const generateGoalSteps = async (goal: Goal, totalDays: number) => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const today = new Date();
    const stepCount = 10;

    const prompt = `
      I want to achieve the following goal in ${totalDays} days:
      Title: ${goal.title}
      Description: ${goal.description || "N/A"}
      
      Please break this down into exactly ${stepCount} steps that are evenly distributed over the ${totalDays} days.
      Each step should have a order, title, description, and due date.
      
      Provide the steps in a JSON array with this format:
      [
        {
          "title": "Step 1 title",
          "description": "Step 1 description",
          "dueDate": "YYYY-MM-DD"
        },
        ...more steps...
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error("Goal Step Generation Error:", error);
    return null;
  }
};

// Generate goal suggestions
export const generateGoalSuggestions = async (
  goals: (Goal & { steps: Step[] })[]
) => {
  if (!process.env.GEMINI_API_KEY || goals.length === 0) {
    return null;
  }

  try {
    const goalsText = goals
      .map((goal) => {
        const completedSteps = goal.steps.filter(
          (step) => step.isCompleted
        ).length;
        const totalSteps = goal.steps.length;
        const progress = Math.round((completedSteps / totalSteps) * 100);

        return `
        Title: ${goal.title}
        Description: ${goal.description || "N/A"}
        Progress: ${progress}% (${completedSteps}/${totalSteps} steps completed)
        Days Remaining: ${daysBetween(new Date(), new Date(goal.createdAt))}/${
          goal.totalDays
        }
      `;
      })
      .join("\n\n");

    const prompt = `
      I have the following goals:
      ${goalsText}
      
      Please provide 1-2 suggestions to help me make progress on these goals.
      Focus on the goals that need the most attention based on their progress and days remaining.
      
      Provide the suggestions in a JSON array with this format:
      [
        {"message": "Prioritize completing Step 3 of your Website Redesign goal which is due soon", "type": "goal"}
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error("Goal Suggestion Generation Error:", error);
    return null;
  }
};

// Generate daily focus suggestions
export const generateDailyFocus = async (
  events: Event[],
  goals: (Goal & { steps: Step[] })[]
) => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const eventsText = events
      .map(
        (event) =>
          `Title: ${event.title}, Description: ${
            event.description || "N/A"
          }, Time: ${formatDateTime(event.startTime)} - ${formatDateTime(
            event.endTime
          )}`
      )
      .join("\n");

    const goalsText = goals
      .map((goal) => {
        const completedSteps = goal.steps.filter(
          (step) => step.isCompleted
        ).length;
        const totalSteps = goal.steps.length;
        const progress = Math.round((completedSteps / totalSteps) * 100);

        return `
        Title: ${goal.title}
        Progress: ${progress}% (${completedSteps}/${totalSteps} steps completed)
      `;
      })
      .join("\n\n");

    const prompt = `
      Today's schedule:
      ${eventsText || "No events scheduled"}
      
      My current goals:
      ${goalsText || "No active goals"}
      
      Based on this information, suggest 1-2 specific focus areas for today.
      These should be actionable, motivational suggestions that will help me make the most of my day
      and move forward on my goals.
      
      Provide the suggestions in a JSON array with this format:
      [
        {"message": "Focus on preparing for your design meeting by reviewing the project requirements", "type": "focus"}
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error("Daily Focus Generation Error:", error);
    return null;
  }
};

// Helper functions
function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    month: "short",
    day: "numeric",
  });
}

function daysBetween(date1: Date, date2: Date) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}
