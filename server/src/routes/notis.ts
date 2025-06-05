import express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import webpush from "web-push";

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

router.post("/save-subscription", authenticate, async (req, res) => {
  const subscription = req.body;

  const { endpoint, keys } = subscription;

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { auth: keys.auth, p256dh: keys.p256dh },
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

router.post("/send-notification", authenticate, async (req, res) => {
  const { title, body } = req.body;

  const payload = JSON.stringify({
    title: title || "New Notification",
    body: body || "This is the default notification body",
  });

  try {
    const allSubs = await prisma.pushSubscription.findMany();

    await Promise.all(
      allSubs.map((sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        };

        return webpush.sendNotification(pushConfig, payload).catch((err) => {
          console.error("Send error:", err);
        });
      })
    );
    res.status(200).json({ message: "Notifications sent" });
  } catch (err) {
    console.error("Notification error:", err);
    res.sendStatus(500);
  }
});

export default router;
