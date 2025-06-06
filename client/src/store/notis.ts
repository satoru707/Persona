import axios from "axios";
import { API_URL } from "../config";

// Function to send notification for upcoming events
async function sendUpcomingEventNotifications(events: [any]) {
  const now = new Date();
  console.log("trying");

  for (const event of events) {
    if (event.isCompleted || !event.startTime) continue;

    const startTime = new Date(event.startTime);
    const notificationTime = new Date(startTime.getTime() - 58 * 60 * 1000); // 10 mins before
    console.log("14");

    if (now < notificationTime || now == startTime) {
      // const timeUntilNotification = notificationTime.getTime() - now.getTime();
      console.log("17");

      setTimeout(async () => {
        try {
          await axios.post(`${API_URL}/api/notis/send-notification`, {
            title: event.title,
            body: event.description,
            type: now == notificationTime ? "now" : "upcoming",
          });
        } catch (error) {
          console.error(
            `Failed to send notification for event ${event.title}:`,
            error.message
          );
        }
      }, 1000 * 10);
    }
  }
}

// Function to send AI suggestion notifications
async function sendAiSuggestionNotifications(suggestions: [any]) {
  setTimeout(async () => {
    for (const suggestion of suggestions) {
      try {
        await axios.post(`${API_URL}/api/notis/send-notification`, {
          title:
            suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1),
          body: suggestion.message,
        });
      } catch (error) {
        console.error(
          `Failed to send notification for ${suggestion.type} suggestion:`,
          error.message
        );
      }
    }
  }, 1000 * 60 * 60);
}

// Main function that runs every 24 hours
async function runDailyNotifications(
  eventsResponse: any,
  suggestionsResponse: any
) {
  try {
    await sendUpcomingEventNotifications(eventsResponse);
    console.log(eventsResponse);

    // Fetch AI suggestions and send notifications

    await sendAiSuggestionNotifications(suggestionsResponse);
    console.log("done");
  } catch (error) {
    console.error("Error in daily notification processing:", error.message);
  } finally {
    setTimeout(runDailyNotifications, 10 * 1000);
  }
}

export default runDailyNotifications;
