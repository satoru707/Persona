"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyFocus = exports.generateGoalSuggestions = exports.generateGoalSteps = exports.generateEventSuggestions = void 0;
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Generate event suggestions
const generateEventSuggestions = async (events) => {
    if (!process.env.GEMINI_API_KEY || events.length === 0) {
        return null;
    }
    try {
        const eventsText = events
            .map((event) => `Title: ${event.title}, Description: ${event.description || "N/A"}, Time: ${formatDateTime(event.startTime)} - ${formatDateTime(event.endTime)}`)
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
    }
    catch (error) {
        console.error("Event Suggestion Generation Error:", error);
        return null;
    }
};
exports.generateEventSuggestions = generateEventSuggestions;
// Generate goal step suggestions
const generateGoalSteps = async (goal, totalDays) => {
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
      Each step should have a title, description, and due date.
      
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
    }
    catch (error) {
        console.error("Goal Step Generation Error:", error);
        return null;
    }
};
exports.generateGoalSteps = generateGoalSteps;
// Generate goal suggestions
const generateGoalSuggestions = async (goals) => {
    if (!process.env.GEMINI_API_KEY || goals.length === 0) {
        return null;
    }
    try {
        const goalsText = goals
            .map((goal) => {
            const completedSteps = goal.steps.filter((step) => step.isCompleted).length;
            const totalSteps = goal.steps.length;
            const progress = Math.round((completedSteps / totalSteps) * 100);
            return `
        Title: ${goal.title}
        Description: ${goal.description || "N/A"}
        Progress: ${progress}% (${completedSteps}/${totalSteps} steps completed)
        Days Remaining: ${daysBetween(new Date(), new Date(goal.createdAt))}/${goal.totalDays}
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
    }
    catch (error) {
        console.error("Goal Suggestion Generation Error:", error);
        return null;
    }
};
exports.generateGoalSuggestions = generateGoalSuggestions;
// Generate daily focus suggestions
const generateDailyFocus = async (events, goals) => {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }
    try {
        const eventsText = events
            .map((event) => `Title: ${event.title}, Description: ${event.description || "N/A"}, Time: ${formatDateTime(event.startTime)} - ${formatDateTime(event.endTime)}`)
            .join("\n");
        const goalsText = goals
            .map((goal) => {
            const completedSteps = goal.steps.filter((step) => step.isCompleted).length;
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
    }
    catch (error) {
        console.error("Daily Focus Generation Error:", error);
        return null;
    }
};
exports.generateDailyFocus = generateDailyFocus;
// Helper functions
function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
    });
}
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}
