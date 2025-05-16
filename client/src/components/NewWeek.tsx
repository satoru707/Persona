import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../config";
import { useState } from "react";

export default function NewWeek() {
  const [events, setEvents] = useState([]);
  function handleNo() {
    console.log("Bummer");
  }

  async function handleYes() {
    const { data } = await axios.get(`${API_URL}/api/events`);
    setEvents(data);

    //   {
    //     id: "1",
    //     title: "Team Standup",
    //     description: "Daily team standup meeting",
    //     startTime: createEventTime(today, 10, 0),
    //     endTime: createEventTime(today, 10, 30),
    //     isCompleted: false,
    //     skippedIsImportant: false,
    //     isSpecial: false,
    //     userId: "1",
    //   },

    //manipulate the date for all in the array to be exactly + 7 days

    //a loop that sends request
    await axios.post(
      `${API_URL}/api/events` //the particular event
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium">New week</h3>

            <p className="mt-2 text-foreground/80">
              All events from the previous week will be copied for this week
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex space-x-2">
          <>
            <button
              onClick={handleNo}
              className="flex-1 btn bg-success/20 text-success hover:bg-success/30"
            >
              Yes
            </button>
            <button
              onClick={handleYes}
              className="flex-1 btn bg-warning/20 text-warning hover:bg-warning/30"
            >
              No
            </button>
          </>
        </div>
      </motion.div>
    </div>
  );
}
