"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const goals_1 = __importDefault(require("./routes/goals"));
const ai_1 = __importDefault(require("./routes/ai"));
const notis_1 = __importDefault(require("./routes/notis"));
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const URL = process.env.CLIENT_URL || "http://localhost:5173";
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: URL,
    credentials: true,
}));
// Routes
app.use("/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/events", events_1.default);
app.use("/api/goals", goals_1.default);
app.use("/api/ai", ai_1.default);
app.use("/api/notis", notis_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "An unexpected error occurred",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// Handle graceful shutdown
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
