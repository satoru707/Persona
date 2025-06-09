"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const index_1 = require("../index");
const web_push_1 = __importDefault(require("web-push"));
require("dotenv/config");
const router = express_1.default.Router();
const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};
web_push_1.default.setVapidDetails(
  "mailto:petolulope7@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
const url = process.env.BACKEND_URL || "http://localhost:3000";
let subscriptions = [];
let notifications = [];
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
function cleanOldNotifications() {
  const now = Date.now();
  const threeDaysInMs = 1000 * 60 * 60 * 24 * 3;
  for (let i = notifications.length - 1; i >= 0; i--) {
    if (now - notifications[i].timestamp > threeDaysInMs) {
      notifications.splice(i, 1);
    }
  }
}
function addNotification(body) {
  const timestamp = Date.now();
  cleanOldNotifications();
  notifications.push({ body, timestamp });
}
function getFormattedNotifications() {
  return notifications.map((noti) => ({
    body: noti.body,
    timeAgo: formatTimeAgo(noti.timestamp),
  }));
}
router.post("/save-subscription", auth_1.authenticate, async (req, res) => {
  const { subscription } = req.body;
  const parsedSubscription = JSON.parse(subscription);
  const { endpoint, keys } = parsedSubscription;
  try {
    await index_1.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        auth: keys === null || keys === void 0 ? void 0 : keys.auth,
        p256dh: keys === null || keys === void 0 ? void 0 : keys.p256dh,
      },
      create: {
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
    });
    res.status(201).json({ message: "Subscription saved" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});
router.post("/send-notification", auth_1.authenticate, async (req, res) => {
  const { title, body, type } = req.body;
  const rando =
    type == "upcoming"
      ? [
          "Your scheduled event is about to begin. Don't miss it!",
          "Just a reminder — your event starts in a few minutes.",
          "Stay prepared! You're almost there.",
          "Time to wrap up — your next task is approaching.",
          "Your next scheduled activity is around the corner.",
        ]
      : [
          "Your scheduled event is starting now.",
          "It's time to jump in — your event is live!",
          "Go time! You're all set to begin.",
          "This is your moment — get started now!",
          "The countdown's over — your activity begins now",
        ];
  setTimeout(async () => {
    const payload = JSON.stringify({
      title: title || "New Notification",
      body: rando[Math.floor(Math.random() * rando.length)],
      icon: `${url}/logo.svg`,
    });
    addNotification(body || title);
    console.log("Notifications:", notifications);
    try {
      const allSubs = await index_1.prisma.pushSubscription.findMany();
      await Promise.all(
        allSubs.map((sub) => {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          };
          return web_push_1.default
            .sendNotification(pushConfig, payload)
            .catch((err) => {
              console.error("Send error:", err);
            });
        })
      );
      res.status(200).json({ message: "Notifications sent" });
    } catch (err) {
      console.error("Notification error:", err);
      res.sendStatus(500);
    }
  }, 30000);
});
router.get("/notis", auth_1.authenticate, async (req, res) => {
  const notis = getFormattedNotifications();
  res.json(notis);
});
exports.default = router;
