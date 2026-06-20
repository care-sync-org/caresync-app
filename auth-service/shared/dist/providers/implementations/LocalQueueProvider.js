"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalQueueProvider = void 0;
const uuid_1 = require("uuid");
class LocalQueueProvider {
    constructor() {
        this.queues = new Map();
    }
    getQueue(queueName) {
        if (!this.queues.has(queueName)) {
            this.queues.set(queueName, []);
        }
        return this.queues.get(queueName);
    }
    async enqueue(queueName, message) {
        const id = (0, uuid_1.v4)();
        const queueMessage = {
            id,
            body: message,
            sentAt: new Date(),
        };
        this.getQueue(queueName).push(queueMessage);
        return id;
    }
    async dequeue(queueName, maxMessages = 1) {
        const queue = this.getQueue(queueName);
        return queue.splice(0, maxMessages);
    }
    async deleteMessage(queueName, messageId) {
        const queue = this.getQueue(queueName);
        const index = queue.findIndex((m) => m.id === messageId);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    }
    async purge(queueName) {
        this.queues.set(queueName, []);
    }
    async getQueueLength(queueName) {
        return this.getQueue(queueName).length;
    }
}
exports.LocalQueueProvider = LocalQueueProvider;
//# sourceMappingURL=LocalQueueProvider.js.map