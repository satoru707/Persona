import axios from "axios";
import { API_URL } from "../config";

// Function to send notification for upcoming events
async function sendUpcomingEventNotifications(events: [any]) {
  const now = new Date();

  for (const event of events) {
    if (event.isCompleted || !event.startTime) continue;

    const startTime = new Date(event.startTime);
    const notificationTime = new Date(startTime.getTime() - 10 * 60 * 1000); // 10 mins before

    if (now < notificationTime) {
      const timeUntilNotification = notificationTime.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await axios.post("/send-notification", {
            title: event.title,
            body: event.description,
          });
          console.log(`Notification sent for event: ${event.title}`);
        } catch (error) {
          console.error(
            `Failed to send notification for event ${event.title}:`,
            error.message
          );
        }
      }, timeUntilNotification);

      console.log(
        `Scheduled notification for event: ${event.title} at ${notificationTime}`
      );
    }
  }
}

// Function to send AI suggestion notifications
async function sendAiSuggestionNotifications(suggestions: [any]) {
  for (const suggestion of suggestions) {
    try {
      await axios.post("/send-notification", {
        title:
          suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1),
        body: suggestion.message,
      });
      console.log(`Notification sent for ${suggestion.type} suggestion`);
    } catch (error) {
      console.error(
        `Failed to send notification for ${suggestion.type} suggestion:`,
        error.message
      );
    }
  }
}

// Main function that runs every 24 hours
async function runDailyNotifications() {
  try {
    // Fetch upcoming events and send notifications
    const eventsResponse = await axios.get(`${API_URL}/api/events/upcoming`);
    await sendUpcomingEventNotifications(eventsResponse.data);

    // Fetch AI suggestions and send notifications
    const suggestionsResponse = await axios.get(
      `${API_URL}/api/ai/suggestions`
    );
    await sendAiSuggestionNotifications(suggestionsResponse.data);

    console.log("Daily notification processing completed");
  } catch (error) {
    console.error("Error in daily notification processing:", error.message);
  } finally {
    setTimeout(runDailyNotifications, 24 * 60 * 60 * 1000);
  }
}

runDailyNotifications();
