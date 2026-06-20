"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const shared_1 = require("@caresync/shared");
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'user-service',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/patients', patient_routes_1.default);
app.use('/api/doctors', doctor_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use(shared_1.notFoundHandler);
app.use(shared_1.globalErrorHandler);
const PORT = parseInt(process.env.PORT ?? '3002');
async function start() {
    try {
        await (0, shared_1.initSecrets)();
        await shared_1.prisma.$connect();
        console.log('✅ [user-service] Database connected');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 [user-service] Running on port ${PORT}`);
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
        console.error('❌ [user-service] Failed to start:', err);
        await shared_1.prisma.$disconnect();
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map