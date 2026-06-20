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
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.getAppointment = getAppointment;
exports.getAllAppointments = getAllAppointments;
const appointmentService = __importStar(require("../services/appointment.service"));
const shared_1 = require("@caresync/shared");
const notificationProvider = (0, shared_1.createNotificationProvider)(shared_1.prisma);
const eventProvider = (0, shared_1.createEventProvider)();
async function createAppointment(req, res, next) {
    try {
        const data = await appointmentService.createAppointment(req.user.userId, req.body, notificationProvider, eventProvider);
        res.status(201).json({ data, message: 'Appointment created successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function updateAppointment(req, res, next) {
    try {
        const data = await appointmentService.updateAppointment(req.params.id, req.user.userId, req.user.role, req.body, notificationProvider, eventProvider);
        res.status(200).json({ data, message: 'Appointment updated successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function getAppointment(req, res, next) {
    try {
        const data = await appointmentService.getAppointmentById(req.params.id);
        res.status(200).json({ data });
    }
    catch (err) {
        next(err);
    }
}
async function getAllAppointments(req, res, next) {
    try {
        const data = await appointmentService.getAllAppointments(req.query);
        res.status(200).json(data);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=appointment.controller.js.map