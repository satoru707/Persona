"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const router = express_1.default.Router();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${URL}/auth/google/callback`;
const oAuth2Client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// Google OAuth login redirect
router.get("/google", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        scope: ["profile", "email"],
    });
    res.json({ url: authUrl, message: "Google auth URL generated" });
});
// Google OAuth callback
router.get("/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
        // Exchange code for tokens
        const { tokens } = await oAuth2Client.getToken({
            code: code,
        });
        oAuth2Client.setCredentials(tokens);
        const userInfoResponse = await oAuth2Client.request({
            url: "https://www.googleapis.com/oauth2/v3/userinfo",
        });
        const { sub: googleId, email, name, picture } = userInfoResponse.data;
        // // Find or create user
        const user = await index_1.prisma.user.upsert({
            where: { email: email },
            update: {
                name: name,
                image: picture,
            },
            create: {
                email: email,
                name: name,
                image: picture,
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // console.log("token", token);
        return res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
});
// For development/demo purposes without OAuth setup
router.post("/demo-login", async (req, res) => {
    try {
        // Create or use a demo user
        const demoUser = await index_1.prisma.user.upsert({
            where: { email: "demo@example.com" },
            update: {},
            create: {
                email: "demo@example.com",
                name: "Demo User",
                image: "https://ui-avatars.com/api/?name=Demo+User&background=8B5CF6&color=fff",
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: demoUser.id, email: demoUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    }
    catch (error) {
        console.error("Demo Login Error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});
exports.default = router;
