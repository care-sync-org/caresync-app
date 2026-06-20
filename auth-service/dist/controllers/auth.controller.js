"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.getMe = getMe;
const authService = __importStar(require("../services/auth.service"));
async function login(req, res, next) {
    try {
        const result = await authService.login(req.body, req.ip ?? undefined);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
        next(err);
    }
}
async function register(req, res, next) {
    try {
        const result = await authService.register(req.body, req.ip ?? undefined);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
        next(err);
    }
}
async function refreshToken(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            res.status(401).json({ error: 'Unauthorized', message: 'Refresh token required', statusCode: 401 });
            return;
        }
        const result = await authService.refreshTokens(token);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken: result.accessToken });
    }
    catch (err) {
        next(err);
    }
}
async function logout(_req, res) {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
}
async function getMe(req, res, next) {
    try {
        const user = await authService.getMe(req.user.userId);
        res.status(200).json({ data: user });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map