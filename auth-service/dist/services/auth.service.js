"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.refreshTokens = refreshTokens;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const shared_1 = require("@caresync/shared");
const SALT_ROUNDS = 12;
async function login(body, ipAddress) {
    const { email, password } = shared_1.loginSchema.parse(body);
    const user = await shared_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw new shared_1.AppError('Invalid credentials', 401, 'Unauthorized');
    }
    const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!passwordMatch) {
        throw new shared_1.AppError('Invalid credentials', 401, 'Unauthorized');
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, shared_1.signAccessToken)(payload);
    const refreshToken = (0, shared_1.signRefreshToken)(payload);
    await (0, shared_1.createAuditLog)({
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        ipAddress,
        details: { email },
    });
    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
}
async function register(body, ipAddress) {
    const data = shared_1.registerSchema.parse(body);
    const existing = await shared_1.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new shared_1.AppError('Email already registered', 409, 'Conflict');
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
    const user = await shared_1.prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName,
        },
    });
    if (data.role === 'PATIENT') {
        await shared_1.prisma.patient.create({ data: { userId: user.id } });
    }
    if (data.role === 'DOCTOR') {
        await shared_1.prisma.doctor.create({
            data: {
                userId: user.id,
                specialization: 'General Medicine',
                licenseNumber: `PENDING-${user.id.slice(0, 8).toUpperCase()}`,
                isAvailable: true,
            },
        });
    }
    await (0, shared_1.createAuditLog)({
        userId: user.id,
        action: 'REGISTER',
        resource: 'auth',
        ipAddress,
        details: { email: data.email, role: data.role },
    });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, shared_1.signAccessToken)(payload);
    const refreshToken = (0, shared_1.signRefreshToken)(payload);
    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
}
async function refreshTokens(token) {
    const payload = (0, shared_1.verifyRefreshToken)(token);
    const user = await shared_1.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        throw new shared_1.AppError('Invalid refresh token', 401, 'Unauthorized');
    }
    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, shared_1.signAccessToken)(newPayload);
    const refreshToken = (0, shared_1.signRefreshToken)(newPayload);
    return { accessToken, refreshToken };
}
async function getMe(userId) {
    const user = await shared_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
            patient: true,
            doctor: true,
        },
    });
    if (!user) {
        throw new shared_1.AppError('User not found', 404, 'Not Found');
    }
    return user;
}
//# sourceMappingURL=auth.service.js.map