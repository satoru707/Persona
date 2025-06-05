import express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import webpush from "web-push";
import { log } from "console";

const router = express.Router();

const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:petolulope7@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];

router.post("/save-subscription", (req, res) => {
  const subscription = req.body;
  console.log(subscription);

  subscriptions.push(subscription); // Save to DB in production
  res.status(201).json({ message: "Subscription saved" });
});

router.post("/send-notification", async (req, res) => {
  const payload = JSON.stringify({
    title: "Reminder!",
    body: "You have a task due soon 🚨",
    url: "https://yourapp.com/tasks",
    image: "https://yourapp.com/banner.jpg",
  });

  try {
    await Promise.all(
      subscriptions.map((sub) => webPush.sendNotification(sub, payload))
    );
    res.status(200).json({ message: "Notifications sent" });
  } catch (err) {
    console.error("Notification error:", err);
    res.sendStatus(500);
  }
});

export default router;
