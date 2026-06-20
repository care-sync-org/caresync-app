"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMockQueueProvider = void 0;
class HttpMockQueueProvider {
    constructor(serviceUrlMap) {
        this.serviceUrlMap = serviceUrlMap;
    }
    async enqueue(queueName, message) {
        const url = this.serviceUrlMap[queueName];
        if (!url) {
            console.warn(`[HttpMockQueueProvider] No target URL for queue "${queueName}"`);
            return 'mock-id';
        }
        console.log(`[HttpMockQueueProvider] Dispatching message to queue "${queueName}" at ${url}:`, message);
        // Fire-and-forget background HTTP call to simulate queue dispatch
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        }).catch((err) => {
            console.error(`[HttpMockQueueProvider] Failed to dispatch to ${url}:`, err);
        });
        return 'mock-id';
    }
    async dequeue(queueName, maxMessages = 1) {
        return [];
    }
    async deleteMessage(queueName, messageId) { }
    async purge(queueName) { }
    async getQueueLength(queueName) {
        return 0;
    }
}
exports.HttpMockQueueProvider = HttpMockQueueProvider;
//# sourceMappingURL=HttpMockQueueProvider.js.map