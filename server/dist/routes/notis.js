"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web_push_1 = __importDefault(require("web-push"));
const router = express_1.default.Router();
const vapidKeys = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};
web_push_1.default.setVapidDetails("mailto:petolulope7@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);
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
        await Promise.all(subscriptions.map((sub) => webPush.sendNotification(sub, payload)));
        res.status(200).json({ message: "Notifications sent" });
    }
    catch (err) {
        console.error("Notification error:", err);
        res.sendStatus(500);
    }
});
exports.default = router;
