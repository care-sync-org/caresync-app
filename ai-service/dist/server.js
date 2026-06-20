"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shared_1 = require("@caresync/shared");
const ai_controller_1 = require("./controllers/ai.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
    });
});
app.post('/internal/summarize', ai_controller_1.handleSummarize);
app.use(shared_1.notFoundHandler);
app.use(shared_1.globalErrorHandler);
const PORT = parseInt(process.env.PORT ?? '3006');
async function start() {
    try {
        await (0, shared_1.initSecrets)();
        await shared_1.prisma.$connect();
        console.log('✅ [ai-service] Database connected');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 [ai-service] Running on port ${PORT}`);
        });
        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            await shared_1.prisma.$disconnect();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (err) {
        console.error('❌ [ai-service] Failed to start:', err);
        await shared_1.prisma.$disconnect();
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map