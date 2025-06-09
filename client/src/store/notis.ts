import axios from "axios";
import { API_URL } from "../config";

// Function to send notification for upcoming events
async function sendUpcomingEventNotifications(events: [any]) {
  const now = new Date();
  if (!events) return;
  for (const event of events) {
    if (event.isCompleted || !event.startTime) continue;

    const startTime = new Date(event.startTime);
    const notificationTime = new Date(startTime.getTime() - 10 * 60 * 1000); // 10 mins before

    if (now < notificationTime || notificationTime == now) {
      const timeUntilNotification = notificationTime.getTime() - now.getTime();
      // console.log("part of timeUntilNotification", timeUntilNotification);

      setTimeout(async () => {
        try {
          await axios.post(`${API_URL}/api/notis/send-notification`, {
            title: event.title,
            body: event.description,
            type: now < notificationTime ? "upcoming" : "now",
          });
          // console.log(`Notification sent for event: ${event.title}`);
        } catch (error) {
          console.error(
            `Failed to send notification for event ${event.title}:`,
            error.message
          );
        }
      }, timeUntilNotification);

      // console.log(
      //   `Scheduled notification for event: ${event.title} at ${notificationTime}`
      // );
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
    // if (!eventsResponse) return;
    await sendUpcomingEventNotifications(eventsResponse);

    await sendAiSuggestionNotifications(suggestionsResponse);
  } catch (error) {
    console.error("Error in daily notification processing:", error.message);
  } finally {
    setTimeout(runDailyNotifications, 3 * 1000);
  }
}

export default runDailyNotifications;
