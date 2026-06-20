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
exports.handleSummarize = handleSummarize;
const aiService = __importStar(require("../services/ai.service"));
function handleSummarize(req, res, next) {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            res.status(400).json({ error: 'Bad Request', message: 'No documentId provided', statusCode: 400 });
            return;
        }
        console.log(`[ai-service] Webhook trigger received for document ID: ${documentId}. Processing asynchronously...`);
        // Respond 202 Accepted immediately to simulate an asynchronous queue handoff
        res.status(202).json({ message: 'Job accepted for processing', documentId });
        // Run the summarization task in the background
        aiService.processDocumentSummary(documentId).catch((err) => {
            console.error(`[ai-service] Error processing document summary for ${documentId}:`, err);
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=ai.controller.js.map