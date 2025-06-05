"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const index_1 = require("../index");
const web_push_1 = __importDefault(require("web-push"));
const router = express_1.default.Router();
const vapidKeys = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};
web_push_1.default.setVapidDetails("mailto:petolulope7@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);
let subscriptions = [];
router.post("/save-subscription", auth_1.authenticate, async (req, res) => {
    const subscription = req.body;
    const { endpoint, keys } = subscription;
    try {
        await index_1.prisma.pushSubscription.upsert({
            where: { endpoint },
            update: { auth: keys.auth, p256dh: keys.p256dh },
            create: {
                endpoint,
                auth: keys.auth,
                p256dh: keys.p256dh,
            },
        });
        res.status(201).json({ message: "Subscription saved" });
    }
    catch (err) {
        console.error("Save error:", err);
        res.status(500).json({ error: "Failed to save subscription" });
    }
});
router.post("/send-notification", auth_1.authenticate, async (req, res) => {
    const { title, body } = req.body;
    const payload = JSON.stringify({
        title: title || "New Notification",
        body: body || "This is the default notification body",
    });
    try {
        const allSubs = await index_1.prisma.pushSubscription.findMany();
        await Promise.all(allSubs.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh,
                },
            };
            return web_push_1.default.sendNotification(pushConfig, payload).catch((err) => {
                console.error("Send error:", err);
            });
        }));
        res.status(200).json({ message: "Notifications sent" });
    }
    catch (err) {
        console.error("Notification error:", err);
        res.sendStatus(500);
    }
});
exports.default = router;
